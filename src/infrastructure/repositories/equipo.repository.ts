import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class EquipoRepository {
  constructor(private readonly supabase: SupabaseAdapter) {}

  async findByCompeticion(competicionId: number) {
    const { data, error } = await this.supabase.from('equipo').select('*, proyecto(*), participante(*)').eq('competicion_id', competicionId);
    if (error) throw error;
    return data ?? [];
  }

  async createTeamWithProjectAndParticipants(payload: {
    competicionId: number;
    equipoNombre: string;
    proyecto: { nombre: string; descripcion?: string | null };
    participantes: Array<{ nombre: string; correo?: string | null; rol?: string | null }>;
  }) {
    const { data: equipo, error: equipoError } = await this.supabase.from('equipo').insert({
      competicion_id: payload.competicionId,
      nombre: payload.equipoNombre
    }).select().single();
    if (equipoError) throw equipoError;

    const { data: proyecto, error: proyectoError } = await this.supabase.from('proyecto').insert({
      equipo_id: equipo.id,
      nombre: payload.proyecto.nombre,
      descripcion: payload.proyecto.descripcion ?? null
    }).select().single();
    if (proyectoError) throw proyectoError;

    if (payload.participantes.length > 0) {
      const { error: participantesError } = await this.supabase.from('participante').insert(
        payload.participantes.map((participante) => ({
          equipo_id: equipo.id,
          nombre: participante.nombre,
          correo: participante.correo ?? null,
          rol: participante.rol ?? 'Sin asignar'
        }))
      );
      if (participantesError) throw participantesError;
    }

    return { equipo, proyecto };
  }

  async update(equipoId: number, payload: {
    nombre: string;
    proyectoId: number | null;
    proyectoNombre: string;
    proyectoDesc?: string | null;
    participantes: Array<{ id?: number; nombre: string; correo: string; rol: string }>;
  }) {
    const { error: e1 } = await this.supabase.from('equipo').update({ nombre: payload.nombre }).eq('id', equipoId);
    if (e1) throw e1;

    if (payload.proyectoId) {
      const { error: e2 } = await this.supabase.from('proyecto').update({
        nombre: payload.proyectoNombre,
        descripcion: payload.proyectoDesc ?? null
      }).eq('id', payload.proyectoId);
      if (e2) throw e2;
    } else {
      const { error: e2 } = await this.supabase.from('proyecto').insert({
        equipo_id: equipoId,
        nombre: payload.proyectoNombre,
        descripcion: payload.proyectoDesc ?? null
      });
      if (e2) throw e2;
    }

    const { data: actuales, error: e3 } = await this.supabase.from('participante').select('id').eq('equipo_id', equipoId);
    if (e3) throw e3;

    const idsConservados = new Set(payload.participantes.filter((p) => p.id).map((p) => p.id));
    const idsEliminar = (actuales ?? []).map((p: any) => p.id).filter((pid: number) => !idsConservados.has(pid));

    if (idsEliminar.length > 0) {
      const { error: e4 } = await this.supabase.from('participante').delete().in('id', idsEliminar);
      if (e4) throw e4;
    }

    for (const p of payload.participantes.filter((p) => p.id)) {
      const { error } = await this.supabase.from('participante').update({
        nombre: p.nombre, correo: p.correo, rol: p.rol
      }).eq('id', p.id!);
      if (error) throw error;
    }

    const nuevos = payload.participantes.filter((p) => !p.id);
    if (nuevos.length > 0) {
      const { error: e5 } = await this.supabase.from('participante').insert(
        nuevos.map((p) => ({ equipo_id: equipoId, nombre: p.nombre, correo: p.correo, rol: p.rol }))
      );
      if (e5) throw e5;
    }
  }

  async delete(equipoId: number) {
    const { data: proyectos } = await this.supabase.from('proyecto').select('id').eq('equipo_id', equipoId);
    const proyectoIds = (proyectos ?? []).map((p: any) => p.id);

    if (proyectoIds.length > 0) {
      const [{ count: votosJuez }, { count: votosPublico }] = await Promise.all([
        this.supabase.from('voto').select('*', { count: 'exact', head: true }).in('proyecto_id', proyectoIds),
        this.supabase.from('voto_publico').select('*', { count: 'exact', head: true }).in('proyecto_id', proyectoIds)
      ]);
      if ((votosJuez ?? 0) > 0 || (votosPublico ?? 0) > 0) {
        throw new Error('No se puede eliminar un equipo que ya tiene votos asociados');
      }
    }

    const { error: encuestaEquipoError } = await this.supabase.from('encuesta_equipo').delete().eq('equipo_id', equipoId);
    if (encuestaEquipoError) throw encuestaEquipoError;

    const { error: participanteError } = await this.supabase.from('participante').delete().eq('equipo_id', equipoId);
    if (participanteError) throw participanteError;

    if (proyectoIds.length > 0) {
      const { error: resultadoError } = await this.supabase.from('resultado').delete().in('proyecto_id', proyectoIds);
      if (resultadoError) throw resultadoError;

      const { error: proyectoError } = await this.supabase.from('proyecto').delete().eq('equipo_id', equipoId);
      if (proyectoError) throw proyectoError;
    }
    const { data, error } = await this.supabase.from('equipo').delete().eq('id', equipoId).select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('No se pudo eliminar el equipo');
    return data;
  }
}
