import { Injectable } from '@nestjs/common';
import { ResultScoreCalculator } from '../../domain/services/result-score.calculator';
import { EncuestaRepository } from '../../infrastructure/repositories/encuesta.repository';
import { ResultadoRepository } from '../../infrastructure/repositories/resultado.repository';
import { VotoRepository } from '../../infrastructure/repositories/voto.repository';
import { VotoPublicoRepository } from '../../infrastructure/repositories/voto-publico.repository';

const TIPOS_PUNTUABLES = ['numerico', 'radio', 'checklist', 'rubrica'];

@Injectable()
export class ResultCalculationService {
  constructor(
    private readonly encuestas: EncuestaRepository,
    private readonly resultados: ResultadoRepository,
    private readonly calculator: ResultScoreCalculator,
    private readonly votos: VotoRepository,
    private readonly votosPublicos: VotoPublicoRepository
  ) {}

  list(surveyId: number) {
    return this.resultados.findByEncuesta(surveyId);
  }

  async getLiveRanking(surveyId: number) {
    const { proyectos, sumaPesos, todasNumericas, todasOpciones, juezCounts, publicoCounts } =
      await this.recolectarDatos(surveyId);

    return proyectos
      .map((proyecto: any) => {
        const respNumericas = todasNumericas
          .filter((r) => r.proyectoId === proyecto.id)
          .map((r) => ({ criterioId: r.criterioId, peso: r.peso, valor: r.valor }));
        const respOpciones = todasOpciones.filter((r) => r.proyectoId === proyecto.id);
        const votosPublico = publicoCounts.get(proyecto.id) ?? 0;
        const votosJurado = juezCounts.get(proyecto.id) ?? 0;
        return {
          id: proyecto.id,
          proyecto_id: proyecto.id,
          proyecto: { id: proyecto.id, nombre: proyecto.nombre, descripcion: proyecto.descripcion },
          puntaje_calculado: this.calculator.calcular(
            { proyectoId: proyecto.id, votosPublico, votosJurado, respuestasNumericas: respNumericas, respuestasOpciones: respOpciones },
            sumaPesos
          ),
          puntaje_manual: null,
          votos: votosPublico + votosJurado
        };
      })
      .sort((a: any, b: any) => b.puntaje_calculado - a.puntaje_calculado || b.votos - a.votos)
      .map((row: any, i: number) => ({ ...row, posicion_final: i + 1, encuesta_id: surveyId }));
  }

  async recalculate(surveyId: number) {
    const { proyectos, sumaPesos, todasNumericas, todasOpciones, juezCounts, publicoCounts } =
      await this.recolectarDatos(surveyId);

    const rows = proyectos
      .map((proyecto: any) => {
        const respNumericas = todasNumericas
          .filter((r) => r.proyectoId === proyecto.id)
          .map((r) => ({ criterioId: r.criterioId, peso: r.peso, valor: r.valor }));
        const respOpciones = todasOpciones.filter((r) => r.proyectoId === proyecto.id);
        return {
          encuesta_id: surveyId,
          proyecto_id: proyecto.id,
          puntaje_calculado: this.calculator.calcular(
            {
              proyectoId: proyecto.id,
              votosPublico: publicoCounts.get(proyecto.id) ?? 0,
              votosJurado: juezCounts.get(proyecto.id) ?? 0,
              respuestasNumericas: respNumericas,
              respuestasOpciones: respOpciones
            },
            sumaPesos
          ),
          calculado_en: new Date().toISOString()
        };
      })
      .sort((a: any, b: any) => b.puntaje_calculado - a.puntaje_calculado)
      .map((row: any, i: number) => ({ ...row, posicion_final: i + 1 }));

    return this.resultados.upsertMany(rows);
  }

  async getComments(surveyId: number) {
    const [juezComments, publicoComments] = await Promise.all([
      this.votos.findComments(surveyId),
      this.votosPublicos.findComments(surveyId)
    ]);
    return [...juezComments, ...publicoComments];
  }

  updateManualScore(resultadoId: number, puntajeManual: number | null) {
    return this.resultados.updateManualScore(resultadoId, puntajeManual);
  }

  private async recolectarDatos(surveyId: number) {
    const [encuesta, criterios, equiposAsignados, juezNumericas, publicoNumericas, juezOpciones, publicoOpciones, juezCounts, publicoCounts] =
      await Promise.all([
        this.encuestas.findById(surveyId),
        this.encuestas.findCriteria(surveyId),
        this.encuestas.findEquipos(surveyId),
        this.votos.findNumericRespuestas(surveyId),
        this.votosPublicos.findNumericRespuestas(surveyId),
        this.votos.findScoringRespuestas(surveyId),
        this.votosPublicos.findScoringRespuestas(surveyId),
        this.votos.countByProject(surveyId),
        this.votosPublicos.countByProject(surveyId)
      ]);

    const puntuables = criterios.filter((c: any) => TIPOS_PUNTUABLES.includes(c.tipo));
    const sumaPesos = puntuables.reduce((s: number, c: any) => s + Number(c.peso ?? 1), 0);
    const equipoIds = new Set(equiposAsignados);
    const equipos = equipoIds.size > 0
      ? (encuesta.competicion?.equipo ?? []).filter((e: any) => equipoIds.has(e.id))
      : (encuesta.competicion?.equipo ?? []);
    const proyectos = equipos.flatMap((e: any) => e.proyecto ?? []);
    const todasNumericas = [...juezNumericas, ...publicoNumericas];
    const todasOpciones = [...juezOpciones, ...publicoOpciones];

    return { proyectos, sumaPesos, todasNumericas, todasOpciones, juezCounts, publicoCounts };
  }
}
