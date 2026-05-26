import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiSummaryRepository } from '../../infrastructure/repositories/ai-summary.repository';
import { VotoPublicoRepository } from '../../infrastructure/repositories/voto-publico.repository';
import { VotoRepository } from '../../infrastructure/repositories/voto.repository';
import { buildProjectSummaryPrompt } from './ai-summary.prompt';

type AiSummaryJson = {
  resumen: string;
  fortalezas: string[];
  mejoras: string[];
  sentimiento: string;
  temas: string[];
};

@Injectable()
export class AiSummaryService {
  constructor(
    private readonly summaries: AiSummaryRepository,
    private readonly votos: VotoRepository,
    private readonly votosPublicos: VotoPublicoRepository,
    private readonly config: ConfigService
  ) {}

  listBySurvey(surveyId: number) {
    return this.summaries.findBySurvey(surveyId);
  }

  async generateForSurvey(surveyId: number) {
    const comments = await this.collectComments(surveyId);
    const grouped = this.groupByProject(comments);

    for (const group of grouped.values()) {
      const aiResult = await this.callAi({
        projectName: group.proyectoNombre,
        teamName: group.equipoNombre,
        comments: group.comments.map((comment) => ({
          texto: comment.texto,
          criterio: comment.criterio,
          origen: comment.origen
        }))
      });

      await this.summaries.replace({
        encuestaId: surveyId,
        proyectoId: group.proyectoId,
        proyectoNombre: group.proyectoNombre,
        equipoNombre: group.equipoNombre,
        resumen: aiResult.resumen,
        fortalezas: aiResult.fortalezas,
        mejoras: aiResult.mejoras,
        sentimiento: aiResult.sentimiento,
        temas: aiResult.temas,
        totalComentarios: group.comments.length,
        modelo: this.config.get<string>('AI_MODEL') ?? null
      });
    }

    return this.summaries.findBySurvey(surveyId);
  }

  private async collectComments(surveyId: number) {
    const [judgeComments, publicComments] = await Promise.all([
      this.votos.findCommentsForAiSummary(surveyId),
      this.votosPublicos.findCommentsForAiSummary(surveyId)
    ]);
    return [...judgeComments, ...publicComments].filter((comment) => comment.proyectoId && comment.texto);
  }

  private groupByProject(comments: Array<{
    texto: string;
    criterio: string;
    proyectoId: number;
    proyecto?: string;
    equipo?: string;
    origen: string;
  }>) {
    const grouped = new Map<number, {
      proyectoId: number;
      proyectoNombre: string;
      equipoNombre?: string | null;
      comments: typeof comments;
    }>();

    for (const comment of comments) {
      const current = grouped.get(comment.proyectoId) ?? {
        proyectoId: comment.proyectoId,
        proyectoNombre: comment.proyecto ?? `Proyecto ${comment.proyectoId}`,
        equipoNombre: comment.equipo ?? null,
        comments: []
      };
      current.comments.push(comment);
      grouped.set(comment.proyectoId, current);
    }

    return grouped;
  }

  private async callAi(input: {
    projectName: string;
    teamName?: string | null;
    comments: Array<{ texto: string; criterio: string; origen: string }>;
  }): Promise<AiSummaryJson> {
    if (input.comments.length === 0) {
      return {
        resumen: 'No hay comentarios suficientes para generar un resumen fiable.',
        fortalezas: [],
        mejoras: [],
        sentimiento: 'insuficiente',
        temas: []
      };
    }

    const apiUrl = this.config.get<string>('AI_API_URL');
    const apiKey = this.config.get<string>('AI_API_KEY');
    const model = this.config.get<string>('AI_MODEL') ?? 'gpt-4o-mini';
    if (!apiUrl || !apiKey) {
      throw new Error('Configura AI_API_URL, AI_API_KEY y AI_MODEL en el backend para generar resúmenes IA');
    }

    const prompt = buildProjectSummaryPrompt(input);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Eres un asistente experto en analisis de feedback. Devuelves solo JSON valido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`No se pudo generar el resumen IA (${response.status}): ${detail.slice(0, 220)}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content ?? data.output_text ?? data.content;
    return this.normalizeAiJson(JSON.parse(content));
  }

  private normalizeAiJson(value: Partial<AiSummaryJson>): AiSummaryJson {
    return {
      resumen: String(value.resumen ?? '').trim() || 'No se pudo generar un resumen claro.',
      fortalezas: Array.isArray(value.fortalezas) ? value.fortalezas.map(String).filter(Boolean).slice(0, 5) : [],
      mejoras: Array.isArray(value.mejoras) ? value.mejoras.map(String).filter(Boolean).slice(0, 5) : [],
      sentimiento: ['positivo', 'mixto', 'critico', 'insuficiente'].includes(String(value.sentimiento))
        ? String(value.sentimiento)
        : 'mixto',
      temas: Array.isArray(value.temas) ? value.temas.map(String).filter(Boolean).slice(0, 6) : []
    };
  }
}
