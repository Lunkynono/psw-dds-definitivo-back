import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class PersonaRepository extends BaseRepository {
  constructor(supabase: SupabaseAdapter) {
    super(supabase, 'persona');
  }

  async findById(id: string) {
    const { data, error } = await this.table().select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async findByCorreo(correo: string) {
    const { data, error } = await this.table().select('*').eq('correo', correo).maybeSingle();
    if (error) throw error;
    return data;
  }

  async upsert(payload: { id: string; nombre: string; correo: string }) {
    const { data, error } = await this.table()
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
