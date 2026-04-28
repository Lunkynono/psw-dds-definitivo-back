import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class EncuestaRepository extends BaseRepository {
  constructor(supabase: SupabaseAdapter) {
    super(supabase, 'encuesta');
  }

  async findById(id: number) {
    const { data, error } = await this.table().select('*, competicion(*, evento(*), equipo(*, proyecto(*)))').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async findByCodigoSala(code: string) {
    const { data, error } = await this.table().select('*, competicion(*)').eq('codigo_sala', code).single();
    if (error) throw error;
    return data;
  }

  async findByCompeticion(competicionId: number) {
    const { data, error } = await this.table().select('*').eq('competicion_id', competicionId).order('created_at');
    if (error) throw error;
    return data ?? [];
  }

  async createWithCriteria(
    payload: Record<string, unknown>,
    criterioIds: number[],
    equipoIds?: number[],
    juecesIds?: string[]
  ) {
    const { data, error } = await this.table().insert(payload).select().single();
    if (error) throw error;

    if (criterioIds.length > 0) {
      const { error: relationError } = await this.supabase.from('encuesta_criterio').insert(
        criterioIds.map((criterioId) => ({ encuesta_id: data.id, criterio_id: criterioId }))
      );
      if (relationError) throw relationError;
    }

    if (equipoIds && equipoIds.length > 0) {
      const { error: equiposError } = await this.supabase.from('encuesta_equipo').insert(
        equipoIds.map((equipo_id) => ({ encuesta_id: data.id, equipo_id }))
      );
      if (equiposError) throw equiposError;
    }

    if (juecesIds && juecesIds.length > 0) {
      const { error: juecesError } = await this.supabase.from('encuesta_juez').insert(
        juecesIds.map((persona_id) => ({ encuesta_id: data.id, persona_id }))
      );
      if (juecesError) throw juecesError;
    }

    return data;
  }

  async findCriteria(encuestaId: number) {
    const { data, error } = await this.supabase.from('encuesta_criterio').select('criterio(*, criterio_opcion(*))').eq('encuesta_id', encuestaId);
    if (error) throw error;
    return (data ?? []).map((row: any) => row.criterio);
  }

  async findEquipos(encuestaId: number) {
    const { data, error } = await this.supabase.from('encuesta_equipo').select('equipo_id').eq('encuesta_id', encuestaId);
    if (error) throw error;
    return (data ?? []).map((row: any) => row.equipo_id as number);
  }

  async getAssignments(encuestaId: number) {
    const { data: encuesta, error: e0 } = await this.table().select('competicion_id').eq('id', encuestaId).single();
    if (e0) throw e0;

    const [{ data: equiposComp }, { data: juecesComp }, { data: equiposEnc }, { data: juecesEnc }] = await Promise.all([
      this.supabase.from('equipo').select('id, nombre, proyecto(id, nombre)').eq('competicion_id', encuesta.competicion_id),
      this.supabase.from('competicion_juez').select('persona_id, persona(nombre, correo)').eq('competicion_id', encuesta.competicion_id),
      this.supabase.from('encuesta_equipo').select('equipo_id').eq('encuesta_id', encuestaId),
      this.supabase.from('encuesta_juez').select('persona_id').eq('encuesta_id', encuestaId)
    ]);

    return {
      equiposDisponibles: equiposComp ?? [],
      equiposAsignados: (equiposEnc ?? []).map((r: any) => r.equipo_id as number),
      juecesDisponibles: juecesComp ?? [],
      juecesAsignados: (juecesEnc ?? []).map((r: any) => r.persona_id as string)
    };
  }

  async updateAssignments(encuestaId: number, equipoIds: number[], juecesIds: string[]) {
    await Promise.all([
      this.supabase.from('encuesta_equipo').delete().eq('encuesta_id', encuestaId),
      this.supabase.from('encuesta_juez').delete().eq('encuesta_id', encuestaId)
    ]);

    if (equipoIds.length > 0) {
      const { error } = await this.supabase.from('encuesta_equipo').insert(
        equipoIds.map((equipo_id) => ({ encuesta_id: encuestaId, equipo_id }))
      );
      if (error) throw error;
    }

    if (juecesIds.length > 0) {
      const { error } = await this.supabase.from('encuesta_juez').insert(
        juecesIds.map((persona_id) => ({ encuesta_id: encuestaId, persona_id }))
      );
      if (error) throw error;
    }
  }

  async updateState(encuestaId: number, estado: string) {
    const { data: actual, error: actualError } = await this.table()
      .select('estado')
      .eq('id', encuestaId)
      .single();
    if (actualError) throw actualError;

    const payload: Record<string, unknown> = { estado };
    if (estado === 'abierta') {
      const ahora = new Date().toISOString();
      payload.hora_apertura = ahora;
      payload.hora_cierre = null;
      payload.hora_reapertura = actual.estado === 'cerrada' ? ahora : null;
    }
    if (estado === 'cerrada') payload.hora_cierre = new Date().toISOString();
    const { data, error } = await this.table().update(payload).eq('id', encuestaId).select().single();
    if (error) throw error;
    return data;
  }

  async updateSchedule(encuestaId: number, horaApertura: string | null, horaCierre: string | null) {
    const { data: actual, error: actualError } = await this.table()
      .select('estado, hora_apertura')
      .eq('id', encuestaId)
      .single();
    if (actualError) throw actualError;

    const now = new Date().toISOString();
    const estado = horaApertura ? 'programada' : 'abierta';
    const payload: Record<string, unknown> = {
      estado,
      hora_apertura: horaApertura ?? (actual.estado === 'abierta' ? actual.hora_apertura ?? now : now),
      hora_cierre: horaCierre ?? null
    };
    const { data, error } = await this.table().update(payload).eq('id', encuestaId).select().single();
    if (error) throw error;
    return data;
  }

  async processScheduled(encuestaId?: number, competicionId?: number) {
    const { error } = await this.supabase.rpc('procesar_encuestas_programadas');
    if (error) {
      const ahora = new Date().toISOString();
      let abrirQuery = this.table()
        .update({ estado: 'abierta', hora_apertura: ahora })
        .eq('estado', 'programada')
        .not('hora_apertura', 'is', null)
        .lte('hora_apertura', ahora);
      if (encuestaId) abrirQuery = abrirQuery.eq('id', encuestaId);
      else if (competicionId) abrirQuery = abrirQuery.eq('competicion_id', competicionId);
      await abrirQuery;

      let cerrarQuery = this.table()
        .update({ estado: 'cerrada', hora_cierre: ahora })
        .in('estado', ['abierta', 'programada'])
        .not('hora_cierre', 'is', null)
        .lte('hora_cierre', ahora);
      if (encuestaId) cerrarQuery = cerrarQuery.eq('id', encuestaId);
      else if (competicionId) cerrarQuery = cerrarQuery.eq('competicion_id', competicionId);
      await cerrarQuery;
    }
    return true;
  }

  async deleteClosed(encuestaId: number) {
    const encuesta = await this.findById(encuestaId);
    if (encuesta.estado !== 'cerrada') {
      throw new Error('Solo se pueden eliminar encuestas cerradas');
    }

    const [{ data: votosJuez }, { data: votosPublico }] = await Promise.all([
      this.supabase.from('voto').select('id').eq('encuesta_id', encuestaId),
      this.supabase.from('voto_publico').select('id').eq('encuesta_id', encuestaId)
    ]);
    const votoIds = (votosJuez ?? []).map((v: any) => v.id);
    const votoPublicoIds = (votosPublico ?? []).map((v: any) => v.id);

    if (votoIds.length > 0) {
      const { error } = await this.supabase.from('respuesta_criterio').delete().in('voto_id', votoIds);
      if (error) throw error;
    }
    if (votoPublicoIds.length > 0) {
      const { error } = await this.supabase.from('respuesta_criterio_publico').delete().in('voto_publico_id', votoPublicoIds);
      if (error) throw error;
    }

    const relationDeletes = await Promise.all([
      this.supabase.from('resultado').delete().eq('encuesta_id', encuestaId),
      this.supabase.from('publico_registro').delete().eq('encuesta_id', encuestaId),
      this.supabase.from('voto').delete().eq('encuesta_id', encuestaId),
      this.supabase.from('voto_publico').delete().eq('encuesta_id', encuestaId),
      this.supabase.from('encuesta_criterio').delete().eq('encuesta_id', encuestaId),
      this.supabase.from('encuesta_equipo').delete().eq('encuesta_id', encuestaId),
      this.supabase.from('encuesta_juez').delete().eq('encuesta_id', encuestaId)
    ]);
    const relationError = relationDeletes.find((result: any) => result.error)?.error;
    if (relationError) throw relationError;

    const { error } = await this.table().delete().eq('id', encuestaId);
    if (error) throw error;
  }
}
