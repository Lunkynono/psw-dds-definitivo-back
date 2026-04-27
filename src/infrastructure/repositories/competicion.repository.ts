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
}
