import { Injectable } from '@nestjs/common';
import { VotanteFactory } from '../../domain/factories/votantes/votante.factory';
import { SurveyStatePolicy } from '../../domain/policies/survey-state.policy';
import { DuplicateVotePolicy } from '../../domain/policies/duplicate-vote.policy';
import { EncuestaRepository } from '../../infrastructure/repositories/encuesta.repository';
import { VotoPublicoRepository } from '../../infrastructure/repositories/voto-publico.repository';
import { IdentifyPublicVoterDto, SubmitPublicVoteDto } from '../../shared/dto/vote.dto';

@Injectable()
export class PublicVotingService {
  constructor(
    private readonly encuestas: EncuestaRepository,
    private readonly votosPublicos: VotoPublicoRepository
  ) {}

  async getRoom(code: string) {
    return this.encuestas.findByCodigoSala(code);
  }

  async identify(code: string, dto: IdentifyPublicVoterDto) {
    const encuesta = await this.encuestas.findByCodigoSala(code);
    SurveyStatePolicy.exigirAbierta(encuesta);
    const alreadyVoted = await this.votosPublicos.existsRegistro(encuesta.id, dto.correo);
    if (alreadyVoted) throw new Error('Este correo ya ha participado en la encuesta');
    return { encuestaId: encuesta.id, correo: dto.correo, codigo: code };
  }

  async getVotingForm(code: string) {
    const encuesta = await this.encuestas.findByCodigoSala(code);
    SurveyStatePolicy.exigirAbierta(encuesta);
    const [encuestaCompleta, criterios, equiposAsignados] = await Promise.all([
      this.encuestas.findById(encuesta.id),
      this.encuestas.findCriteria(encuesta.id),
      this.encuestas.findEquipos(encuesta.id)
    ]);
    const equipoIds = new Set(equiposAsignados);
    const equiposFiltrados = equipoIds.size > 0
      ? (encuestaCompleta.competicion?.equipo ?? []).filter((e: any) => equipoIds.has(e.id))
      : (encuestaCompleta.competicion?.equipo ?? []);
    const proyectos = equiposFiltrados.flatMap((e: any) => e.proyecto ?? []);
    return { encuesta: encuestaCompleta, proyectos, criterios };
  }

  async submit(code: string, dto: SubmitPublicVoteDto) {
    const encuesta = await this.encuestas.findByCodigoSala(code);
    SurveyStatePolicy.exigirAbierta(encuesta);
    const votante = VotanteFactory.crearPublico();
    const votos = votante.crearVotos(encuesta.id, dto.correo, dto.votos);

    try {
      return await this.votosPublicos.registerAndCreateVotes(encuesta.id, dto.correo, votos);
    } catch (error) {
      DuplicateVotePolicy.traducirError(error);
    }
  }
}
