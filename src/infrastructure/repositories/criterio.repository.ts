import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

export interface OpcionPayload {
  texto: string;
  orden: number;
  peso?: number;
  aspecto?: string | null;
  nivel?: string | null;
  descriptor?: string | null;
}

@Injectable()
export class CriterioRepository extends BaseRepository {
  constructor(supabase: SupabaseAdapter) {
    super(supabase, 'criterio');
  }

  async findByCompeticion(competicionId: number) {
    const { data, error } = await this.table().select('*, criterio_opcion(*)').eq('competicion_id', competicionId).order('orden');
    if (error) throw error;
    return data ?? [];
  }

  async create(payload: Record<string, unknown>, opciones: OpcionPayload[] = []) {
    const { data, error } = await this.table().insert(payload).select().single();
    if (error) throw error;

    if (opciones.length > 0) {
      const { error: optionError } = await this.supabase.from('criterio_opcion').insert(
        opciones.map((opcion) => ({
          criterio_id: data.id,
          texto: opcion.texto,
          orden: opcion.orden,
          peso: opcion.peso ?? 0,
          aspecto: opcion.aspecto ?? null,
          nivel: opcion.nivel ?? null,
          descriptor: opcion.descriptor ?? null
        }))
      );
      if (optionError) throw optionError;
    }

    return data;
  }

  async update(id: number, payload: Record<string, unknown>, opciones: OpcionPayload[] = []) {
    const { data, error } = await this.table().update(payload).eq('id', id).select().single();
    if (error) throw error;

    const { error: delError } = await this.supabase.from('criterio_opcion').delete().eq('criterio_id', id);
    if (delError) throw delError;

    if (opciones.length > 0) {
      const { error: optionError } = await this.supabase.from('criterio_opcion').insert(
        opciones.map((opcion) => ({
          criterio_id: id,
          texto: opcion.texto,
          orden: opcion.orden,
          peso: opcion.peso ?? 0,
          aspecto: opcion.aspecto ?? null,
          nivel: opcion.nivel ?? null,
          descriptor: opcion.descriptor ?? null
        }))
      );
      if (optionError) throw optionError;
    }

    return data;
  }

  async delete(id: number) {
    const { error: relationError } = await this.supabase.from('encuesta_criterio').delete().eq('criterio_id', id);
    if (relationError) throw relationError;

    const { error: optionError } = await this.supabase.from('criterio_opcion').delete().eq('criterio_id', id);
    if (optionError) throw optionError;

    const { error } = await this.table().delete().eq('id', id);
    if (error) throw error;
  }
}
