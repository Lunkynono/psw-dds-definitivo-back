import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class EventoRepository extends BaseRepository {
  constructor(supabase: SupabaseAdapter) {
    super(supabase, 'evento');
  }

  async findByOrganizador(organizadorId: string) {
    const { data, error } = await this.table().select('*, competicion(count)').eq('organizador_id', organizadorId).order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async findPublicOptions() {
    const { data, error } = await this.table().select('id, nombre, imagen_url').order('nombre');
    if (error) throw error;
    return data ?? [];
  }

  async findById(id: number) {
    const { data, error } = await this.table().select('*').eq('id', id).single();
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

  async updateImagenUrl(id: number, imagenUrl: string) {
    const { data, error } = await this.table().update({ imagen_url: imagenUrl }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: number) {
    const { error } = await this.table().delete().eq('id', id);
    if (error) throw error;
  }
}
