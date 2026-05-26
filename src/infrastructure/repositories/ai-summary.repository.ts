import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../supabase/supabase.adapter';

@Injectable()
export class AiSummaryRepository {
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

    const { error: deleteError } = await this.supabase
      .from('proyecto_resumen_ia')
      .delete()
      .eq('encuesta_id', summary.encuestaId)
      .eq('proyecto_id', summary.proyectoId);
    if (deleteError) throw deleteError;

    const { data, error } = await this.supabase
      .from('proyecto_resumen_ia')
      .insert({
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
        updated_at: now
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
