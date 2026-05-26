import { Injectable, Logger } from '@nestjs/common';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class AiSummaryRepository {
  private readonly logger = new Logger(AiSummaryRepository.name);

  constructor(private readonly supabase: SupabaseAdapter) {}

  async findBySurvey(surveyId: number) {
    const { data, error } = await this.supabase
      .from('proyecto_resumen_ia')
      .select('*')
      .eq('encuesta_id', surveyId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }

  async replace(summary: {
    encuestaId: number;
    proyectoId: number;
    proyectoNombre: string;
    equipoNombre?: string | null;
    resumen: string;
    fortalezas: string[];
    mejoras: string[];
    sentimiento: string;
    temas: string[];
    totalComentarios: number;
    modelo?: string | null;
  }) {
    const now = new Date().toISOString();
    const payload = {
      encuesta_id: summary.encuestaId,
      proyecto_id: summary.proyectoId,
      proyecto_nombre: summary.proyectoNombre,
      equipo_nombre: summary.equipoNombre ?? null,
      resumen: summary.resumen,
      fortalezas: summary.fortalezas,
      mejoras: summary.mejoras,
      sentimiento: summary.sentimiento,
      temas: summary.temas,
      total_comentarios: summary.totalComentarios,
      modelo: summary.modelo ?? null,
      created_at: now,
      updated_at: now
    };

    this.logger.log(JSON.stringify({
      message: 'Reemplazo proyecto_resumen_ia',
      encuesta_id: payload.encuesta_id,
      proyecto_id: payload.proyecto_id,
      proyecto_nombre: payload.proyecto_nombre,
      total_comentarios: payload.total_comentarios,
      fortalezas_length: payload.fortalezas.length,
      mejoras_length: payload.mejoras.length,
      temas_length: payload.temas.length,
      sentimiento: payload.sentimiento,
      modelo: payload.modelo,
      has_created_at: Boolean(payload.created_at),
      has_updated_at: Boolean(payload.updated_at)
    }));

    const { error: deleteError } = await this.supabase
      .from('proyecto_resumen_ia')
      .delete()
      .eq('encuesta_id', summary.encuestaId)
      .eq('proyecto_id', summary.proyectoId);
    if (deleteError) {
      this.logger.error(JSON.stringify({
        message: 'Error borrando resumen IA anterior',
        error: deleteError
      }));
      throw deleteError;
    }

    const { data, error } = await this.supabase
      .from('proyecto_resumen_ia')
      .insert(payload)
      .select()
      .single();
    if (error) {
      this.logger.error(JSON.stringify({
        message: 'Error reemplazando proyecto_resumen_ia',
        error
      }));
      throw error;
    }
    return data;
  }
}
