import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../supabase/supabase.adapter';
import { VotoPublico } from '../../domain/entities/voto.entity';

@Injectable()
export class VotoPublicoRepository {
  constructor(private readonly supabase: SupabaseAdapter) {}

  async findNumericRespuestas(surveyId: number) {
    const { data, error } = await this.supabase
      .from('respuesta_criterio_publico')
      .select('criterio_id, valor_numerico, criterio!inner(peso), voto_publico!inner(proyecto_id, encuesta_id)')
      .eq('voto_publico.encuesta_id', surveyId)
      .not('valor_numerico', 'is', null);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      proyectoId: r.voto_publico.proyecto_id,
      criterioId: r.criterio_id,
      peso: Number(r.criterio.peso),
      valor: Number(r.valor_numerico)
    }));
  }

  async findScoringRespuestas(surveyId: number) {
    const { data, error } = await this.supabase
      .from('respuesta_criterio_publico')
      .select('criterio_id, opciones_ids, criterio!inner(tipo, peso, criterio_opcion(id, peso)), voto_publico!inner(proyecto_id, encuesta_id)')
      .eq('voto_publico.encuesta_id', surveyId)
      .not('opciones_ids', 'is', null);
    if (error) throw error;
    return (data ?? [])
      .filter((r: any) => ['radio', 'checklist', 'rubrica'].includes(r.criterio?.tipo))
      .map((r: any) => ({
        proyectoId: r.voto_publico.proyecto_id,
        criterioId: r.criterio_id,
        tipo: r.criterio.tipo,
        peso: Number(r.criterio.peso),
        opcionesIds: (r.opciones_ids ?? []).map(Number),
        opcionesDisponibles: (r.criterio.criterio_opcion ?? []).map((op: any) => ({ id: Number(op.id), peso: Number(op.peso) || 0 }))
      }));
  }

  async countByProject(surveyId: number): Promise<Map<number, number>> {
    const { data, error } = await this.supabase
      .from('voto_publico').select('proyecto_id').eq('encuesta_id', surveyId);
    if (error) throw error;
    const counts = new Map<number, number>();
    for (const row of (data ?? [])) counts.set(row.proyecto_id, (counts.get(row.proyecto_id) ?? 0) + 1);
    return counts;
  }

  async findComments(surveyId: number) {
    const { data, error } = await this.supabase
      .from('respuesta_criterio_publico')
      .select('valor_texto, criterio!inner(tipo, titulo), voto_publico!inner(encuesta_id, proyecto(nombre))')
      .eq('voto_publico.encuesta_id', surveyId)
      .not('valor_texto', 'is', null);
    if (error) throw error;
    return (data ?? [])
      .filter((r: any) => r.criterio?.tipo === 'comentario')
      .map((r: any) => ({
        texto: r.valor_texto,
        criterio: r.criterio?.titulo,
        proyecto: r.voto_publico?.proyecto?.nombre,
        origen: 'Público'
      }));
  }

  async findCommentsForAiSummary(surveyId: number) {
    const { data, error } = await this.supabase
      .from('respuesta_criterio_publico')
      .select('valor_texto, criterio!inner(tipo, titulo), voto_publico!inner(encuesta_id, proyecto_id, proyecto(id, nombre, equipo(nombre)))')
      .eq('voto_publico.encuesta_id', surveyId)
      .not('valor_texto', 'is', null);
    if (error) throw error;
    return (data ?? [])
      .filter((r: any) => r.criterio?.tipo === 'comentario' && r.valor_texto?.trim())
      .map((r: any) => ({
        texto: r.valor_texto.trim(),
        criterio: r.criterio?.titulo ?? 'Comentario',
        proyectoId: Number(r.voto_publico?.proyecto_id),
        proyecto: r.voto_publico?.proyecto?.nombre,
        equipo: r.voto_publico?.proyecto?.equipo?.nombre,
        origen: 'Publico'
      }));
  }

  async existsRegistro(encuestaId: number, correo: string) {
    const { data, error } = await this.supabase.from('publico_registro').select('*').eq('encuesta_id', encuestaId).eq('correo_votante', correo).maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async registerAndCreateVotes(encuestaId: number, correo: string, votos: VotoPublico[]) {
    const { error: registroError } = await this.supabase.from('publico_registro').insert({ encuesta_id: encuestaId, correo_votante: correo });
    if (registroError) throw registroError;

    for (const voto of votos) {
      const { data, error } = await this.supabase.from('voto_publico').insert({
        encuesta_id: voto.encuestaId,
        proyecto_id: voto.proyectoId,
        correo_votante: voto.correoVotante
      }).select().single();
      if (error) throw error;

      if (voto.respuestas.length > 0) {
        const { error: respuestasError } = await this.supabase.from('respuesta_criterio_publico').insert(
          voto.respuestas.map((respuesta) => ({
            voto_publico_id: data.id,
            criterio_id: respuesta.criterioId,
            valor_numerico: respuesta.valorNumerico ?? null,
            opciones_ids: respuesta.opcionesIds ?? null,
            valor_texto: respuesta.valorTexto ?? null
          }))
        );
        if (respuestasError) throw respuestasError;
      }
    }

    return true;
  }
}
