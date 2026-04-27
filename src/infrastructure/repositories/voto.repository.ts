import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../supabase/supabase.adapter';
import { VotoJuez } from '../../domain/entities/voto.entity';

@Injectable()
export class VotoRepository {
  constructor(private readonly supabase: SupabaseAdapter) {}

  async findNumericRespuestas(surveyId: number) {
    const { data, error } = await this.supabase
      .from('respuesta_criterio')
      .select('criterio_id, valor_numerico, criterio!inner(peso), voto!inner(proyecto_id, encuesta_id)')
      .eq('voto.encuesta_id', surveyId)
      .not('valor_numerico', 'is', null);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      proyectoId: r.voto.proyecto_id,
      criterioId: r.criterio_id,
      peso: Number(r.criterio.peso),
      valor: Number(r.valor_numerico)
    }));
  }

  async findScoringRespuestas(surveyId: number) {
    const { data, error } = await this.supabase
      .from('respuesta_criterio')
      .select('criterio_id, opciones_ids, criterio!inner(tipo, peso, criterio_opcion(id, peso)), voto!inner(proyecto_id, encuesta_id)')
      .eq('voto.encuesta_id', surveyId)
      .not('opciones_ids', 'is', null);
    if (error) throw error;
    return (data ?? [])
      .filter((r: any) => ['radio', 'checklist', 'rubrica'].includes(r.criterio?.tipo))
      .map((r: any) => ({
        proyectoId: r.voto.proyecto_id,
        criterioId: r.criterio_id,
        tipo: r.criterio.tipo,
        peso: Number(r.criterio.peso),
        opcionesIds: (r.opciones_ids ?? []).map(Number),
        opcionesDisponibles: (r.criterio.criterio_opcion ?? []).map((op: any) => ({ id: Number(op.id), peso: Number(op.peso) || 0 }))
      }));
  }

  async countByProject(surveyId: number): Promise<Map<number, number>> {
    const { data, error } = await this.supabase
      .from('voto').select('proyecto_id').eq('encuesta_id', surveyId);
    if (error) throw error;
    const counts = new Map<number, number>();
    for (const row of (data ?? [])) counts.set(row.proyecto_id, (counts.get(row.proyecto_id) ?? 0) + 1);
    return counts;
  }

  async findComments(surveyId: number) {
    const { data, error } = await this.supabase
      .from('respuesta_criterio')
      .select('valor_texto, criterio!inner(tipo, titulo), voto!inner(encuesta_id, proyecto(nombre))')
      .eq('voto.encuesta_id', surveyId)
      .not('valor_texto', 'is', null);
    if (error) throw error;
    return (data ?? [])
      .filter((r: any) => r.criterio?.tipo === 'comentario')
      .map((r: any) => ({
        texto: r.valor_texto,
        criterio: r.criterio?.titulo,
        proyecto: r.voto?.proyecto?.nombre,
        origen: 'Jurado'
      }));
  }

  async findJudgeVotes(encuestaId: number, voterHash: string) {
    const { data, error } = await this.supabase.from('voto').select('*').eq('encuesta_id', encuestaId).eq('voter_hash', voterHash);
    if (error) throw error;
    return data ?? [];
  }

  async createJudgeVote(voto: VotoJuez) {
    const { data, error } = await this.supabase.from('voto').insert({
      encuesta_id: voto.encuestaId,
      proyecto_id: voto.proyectoId,
      voter_hash: voto.voterHash
    }).select().single();
    if (error) throw error;

    if (voto.respuestas.length > 0) {
      const { error: respuestasError } = await this.supabase.from('respuesta_criterio').insert(
        voto.respuestas.map((respuesta) => ({
          voto_id: data.id,
          criterio_id: respuesta.criterioId,
          valor_numerico: respuesta.valorNumerico ?? null,
          opciones_ids: respuesta.opcionesIds ?? null,
          valor_texto: respuesta.valorTexto ?? null
        }))
      );
      if (respuestasError) throw respuestasError;
    }

    return data;
  }
}
