import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class PersonaRepository extends BaseRepository {
  constructor(supabase: SupabaseAdapter) {
    super(supabase, 'persona');
  }

  async findById(id: string) {
    const { data, error } = await this.table().select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async findByCorreo(correo: string) {
    const { data, error } = await this.table().select('*').eq('correo', correo).maybeSingle();
    if (error) throw error;
    return data;
  }
}
