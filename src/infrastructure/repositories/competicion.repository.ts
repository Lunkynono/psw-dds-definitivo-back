import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class CompeticionRepository extends BaseRepository {
  constructor(supabase: SupabaseAdapter) {
    super(supabase, 'competicion');
  }

  async findByEvento(eventoId: number) {
    const { data, error } = await this.table().select('*').eq('evento_id', eventoId).order('created_at');
    if (error) throw error;
    return data ?? [];
  }

  async findById(id: number) {
    const { data, error } = await this.table().select('*, evento(organizador_id, nombre, id)').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async create(payload: Record<string, unknown>) {
    const { data, error } = await this.table().insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: number, payload: Record<string, unknown>) {
    const { data, error } = await this.table().update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { error: premioError } = await this.supabase.from('premio').delete().eq('competicion_id', id);
    if (premioError && premioError.code !== '42P01') throw premioError;

    const [{ data: encuestas }, { data: criterios }, { data: equipos }] = await Promise.all([
      this.supabase.from('encuesta').select('id').eq('competicion_id', id),
      this.supabase.from('criterio').select('id').eq('competicion_id', id),
      this.supabase.from('equipo').select('id, proyecto(id)').eq('competicion_id', id)
    ]);

    const encuestaIds = (encuestas ?? []).map((encuesta: any) => encuesta.id);
    const criterioIds = (criterios ?? []).map((criterio: any) => criterio.id);
    const equipoIds = (equipos ?? []).map((equipo: any) => equipo.id);
    const proyectoIds = (equipos ?? []).flatMap((equipo: any) => (equipo.proyecto ?? []).map((proyecto: any) => proyecto.id));

    if (encuestaIds.length > 0) {
      const [{ data: votosJuez }, { data: votosPublico }] = await Promise.all([
        this.supabase.from('voto').select('id').in('encuesta_id', encuestaIds),
        this.supabase.from('voto_publico').select('id').in('encuesta_id', encuestaIds)
      ]);
      const votoIds = (votosJuez ?? []).map((voto: any) => voto.id);
      const votoPublicoIds = (votosPublico ?? []).map((voto: any) => voto.id);

      if (votoIds.length > 0) {
        const { error } = await this.supabase.from('respuesta_criterio').delete().in('voto_id', votoIds);
        if (error) throw error;
      }
      if (votoPublicoIds.length > 0) {
        const { error } = await this.supabase.from('respuesta_criterio_publico').delete().in('voto_publico_id', votoPublicoIds);
        if (error) throw error;
      }

      const relationDeletes = await Promise.all([
        this.supabase.from('resultado').delete().in('encuesta_id', encuestaIds),
        this.supabase.from('publico_registro').delete().in('encuesta_id', encuestaIds),
        this.supabase.from('voto').delete().in('encuesta_id', encuestaIds),
        this.supabase.from('voto_publico').delete().in('encuesta_id', encuestaIds),
        this.supabase.from('encuesta_criterio').delete().in('encuesta_id', encuestaIds),
        this.supabase.from('encuesta_equipo').delete().in('encuesta_id', encuestaIds),
        this.supabase.from('encuesta_juez').delete().in('encuesta_id', encuestaIds)
      ]);
      const relationError = relationDeletes.find((result: any) => result.error)?.error;
      if (relationError) throw relationError;

      const { error } = await this.supabase.from('encuesta').delete().in('id', encuestaIds);
      if (error) throw error;
    }

    if (criterioIds.length > 0) {
      const { error: relationError } = await this.supabase.from('encuesta_criterio').delete().in('criterio_id', criterioIds);
      if (relationError) throw relationError;
      const { error: optionError } = await this.supabase.from('criterio_opcion').delete().in('criterio_id', criterioIds);
      if (optionError) throw optionError;
      const { error: criterioError } = await this.supabase.from('criterio').delete().in('id', criterioIds);
      if (criterioError) throw criterioError;
    }

    if (equipoIds.length > 0) {
      const [{ error: encuestaEquipoError }, { error: participanteError }] = await Promise.all([
        this.supabase.from('encuesta_equipo').delete().in('equipo_id', equipoIds),
        this.supabase.from('participante').delete().in('equipo_id', equipoIds)
      ]);
      if (encuestaEquipoError) throw encuestaEquipoError;
      if (participanteError) throw participanteError;
    }

    if (proyectoIds.length > 0) {
      const [{ error: resultadoError }, { error: proyectoError }] = await Promise.all([
        this.supabase.from('resultado').delete().in('proyecto_id', proyectoIds),
        this.supabase.from('proyecto').delete().in('id', proyectoIds)
      ]);
      if (resultadoError) throw resultadoError;
      if (proyectoError) throw proyectoError;
    }

    if (equipoIds.length > 0) {
      const { error } = await this.supabase.from('equipo').delete().in('id', equipoIds);
      if (error) throw error;
    }

    const { error: juezError } = await this.supabase.from('competicion_juez').delete().eq('competicion_id', id);
    if (juezError) throw juezError;
    const { error } = await this.table().delete().eq('id', id);
    if (error) throw error;
  }
}
