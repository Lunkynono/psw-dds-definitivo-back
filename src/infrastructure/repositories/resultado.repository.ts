import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class ResultadoRepository {
  constructor(private readonly supabase: SupabaseAdapter) {}

  async findByEncuesta(encuestaId: number) {
    const { data, error } = await this.supabase.from('resultado').select('*, proyecto(*)').eq('encuesta_id', encuestaId).order('posicion_final');
    if (error) throw error;
    return data ?? [];
  }

  async upsertMany(rows: Array<Record<string, unknown>>) {
    const { data, error } = await this.supabase.from('resultado').upsert(rows, { onConflict: 'encuesta_id,proyecto_id' }).select();
    if (error) throw error;
    return data ?? [];
  }

  async updateManualScore(resultadoId: number, puntajeManual: number | null) {
    const { data, error } = await this.supabase.from('resultado').update({ puntaje_manual: puntajeManual }).eq('id', resultadoId).select().single();
    if (error) throw error;
    return data;
  }
}
