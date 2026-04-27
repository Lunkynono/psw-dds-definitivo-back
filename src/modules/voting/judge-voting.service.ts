import { Injectable } from '@nestjs/common';
import { VotanteFactory } from '../../domain/factories/votantes/votante.factory';
import { SurveyStatePolicy } from '../../domain/policies/survey-state.policy';
import { DuplicateVotePolicy } from '../../domain/policies/duplicate-vote.policy';
import { EncuestaRepository } from '../../infrastructure/repositories/encuesta.repository';
import { VotoRepository } from '../../infrastructure/repositories/voto.repository';
import { SupabaseAdapter } from '../../infrastructure/supabase/supabase.adapter';
import { SubmitJudgeVoteDto } from '../../shared/dto/vote.dto';
import { VoterHashService } from '../../shared/utils/voter-hash.service';

/**
 * Caso de uso "Votación del jurado".
 *
 * Replica exactamente el comportamiento del monorepo original (`pages/juez/*`):
 *  - Sólo expone encuestas en estado `abierta` asignadas al juez.
 *  - Para cada encuesta abierta, devuelve los proyectos de la competición y
 *    los proyectos pendientes de voto, calculados a partir del `voter_hash`.
 *  - El voto en sí se delega en `VotanteFactory.crearJuez()` para mantener el
 *    Factory Method por tipo de votante.
 */
@Injectable()
export class JudgeVotingService {
  constructor(
    private readonly encuestas: EncuestaRepository,
    private readonly votos: VotoRepository,
    private readonly hashes: VoterHashService,
    private readonly supabase: SupabaseAdapter
  ) {}

  /**
   * Devuelve las encuestas abiertas asignadas al juez con sus proyectos y los
   * proyectos pendientes de evaluar (los que aún no tienen voto del juez).
   * Pre-cargar esta información evita que el frontend tenga que hacer N+1
   * llamadas para reconstruir el estado del dashboard.
   */
  async listAssignedOpenSurveys(userId: string) {
    const { data, error } = await this.supabase
      .from('encuesta_juez')
      .select('encuesta(*, competicion(nombre, evento(nombre)))')
      .eq('persona_id', userId);
    if (error) throw error;

    const encuestasAbiertas = (data ?? [])
      .map((row: any) => row.encuesta)
      .filter((encuesta: any) => encuesta?.estado === 'abierta');

    return Promise.all(
      encuestasAbiertas.map(async (encuesta: any) => {
        const proyectos = await this.findProyectosCompeticion(encuesta.competicion_id);
        const voterHash = this.hashes.generar(userId, encuesta.id);
        const votados = await this.findVotedProjectIds(encuesta.id, voterHash);
        const pendientes = proyectos.filter((p: any) => !votados.has(p.id));
        return { ...encuesta, proyectos, pendientes };
      })
    );
  }

  /** Datos necesarios para que el juez evalúe un proyecto concreto. */
  async getVotingForm(surveyId: number, projectId: number) {
    const [encuesta, criterios] = await Promise.all([
      this.encuestas.findById(surveyId),
      this.encuestas.findCriteria(surveyId)
    ]);
    const proyectos = (encuesta.competicion?.equipo ?? []).flatMap((equipo: any) => equipo.proyecto ?? []);
    const proyecto = proyectos.find((item: any) => item.id === projectId);
    return { encuesta, proyecto, criterios };
  }

  /**
   * Registra un voto del jurado validando primero que la encuesta esté abierta
   * y delegando la creación del agregado en el Factory Method del dominio.
   */
  async submit(userId: string, surveyId: number, projectId: number, dto: SubmitJudgeVoteDto) {
    const encuesta = await this.encuestas.findById(surveyId);
    SurveyStatePolicy.exigirAbierta(encuesta);
    const voterHash = this.hashes.generar(userId, surveyId);
    const votante = VotanteFactory.crearJuez();
    const voto = votante.crearVoto(surveyId, projectId, voterHash, dto.respuestas);

    try {
      return await this.votos.createJudgeVote(voto);
    } catch (error) {
      DuplicateVotePolicy.traducirError(error);
    }
  }

  /** Aplana los proyectos de todos los equipos de una competición. */
  private async findProyectosCompeticion(competicionId: number) {
    const { data, error } = await this.supabase
      .from('equipo')
      .select('proyecto(*)')
      .eq('competicion_id', competicionId);
    if (error) throw error;
    return (data ?? []).flatMap((eq: any) => eq.proyecto ?? []);
  }

  /** Conjunto de IDs de proyecto ya votados por un juez en una encuesta. */
  private async findVotedProjectIds(encuestaId: number, voterHash: string): Promise<Set<number>> {
    const votos = await this.votos.findJudgeVotes(encuestaId, voterHash);
    return new Set(votos.map((v: any) => v.proyecto_id));
  }
}
