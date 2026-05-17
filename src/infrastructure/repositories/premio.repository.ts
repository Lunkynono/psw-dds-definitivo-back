import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class PremioRepository extends BaseRepository {
  constructor(supabase: SupabaseAdapter) {
    super(supabase, 'premio');
  }

  async findByEvento(eventoId: number) {
    const { data, error } = await this.table()
      .select('*')
      .eq('evento_id', eventoId)
      .is('competicion_id', null)
      .order('posicion', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  async findByCompeticion(competicionId: number) {
    const { data, error } = await this.table()
      .select('*')
      .eq('competicion_id', competicionId)
      .order('posicion', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
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
    const { error } = await this.table().delete().eq('id', id);
    if (error) throw error;
  }

  async deleteByEvento(eventoId: number) {
    const { error } = await this.table().delete().eq('evento_id', eventoId);
    if (error) throw error;
  }

  async deleteByCompeticion(competicionId: number) {
    const { error } = await this.table().delete().eq('competicion_id', competicionId);
    if (error) throw error;
  }
}
