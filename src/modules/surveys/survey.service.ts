import { Injectable } from '@nestjs/common';
import { SurveyStatePolicy } from '../../domain/policies/survey-state.policy';
import { EncuestaRepository } from '../../infrastructure/repositories/encuesta.repository';
import { CreateSurveyDto, UpdateSurveyStateDto } from '../../shared/dto/survey.dto';
import { SurveyCodeGenerator } from '../../shared/utils/survey-code.generator';
import { CriteriaService } from '../criteria/criteria.service';

@Injectable()
export class SurveyService {
  constructor(
    private readonly encuestas: EncuestaRepository,
    private readonly criterios: CriteriaService,
    private readonly codes: SurveyCodeGenerator
  ) {}

  list(competitionId: number) {
    return this.encuestas.findByCompeticion(competitionId);
  }

  get(surveyId: number) {
    return this.encuestas.findById(surveyId);
  }

  async create(competitionId: number, creatorId: string, dto: CreateSurveyDto) {
    const criterioIds = await this.criterios.ensureCommentCriterion(competitionId, dto.criterioIds);

    const estadoEncuesta = dto.horaApertura ? 'programada' : 'abierta';
    const horaAperturaReal = dto.horaApertura ?? new Date().toISOString();

    return this.encuestas.createWithCriteria(
      {
        competicion_id: competitionId,
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        tipo_votante: dto.tipoVotante,
        peso: dto.peso,
        creador_id: creatorId,
        estado: estadoEncuesta,
        codigo_sala: dto.tipoVotante === 'juez' ? null : this.codes.generar(),
        hora_apertura: horaAperturaReal,
        hora_cierre: dto.horaCierre ?? null
      },
      criterioIds,
      dto.equipoIds,
      dto.juecesIds
    );
  }

  async updateState(surveyId: number, dto: UpdateSurveyStateDto) {
    const actual = await this.encuestas.findById(surveyId);
    if (!SurveyStatePolicy.puedeCambiarEstado(actual.estado, dto.estado)) {
      throw new Error(`No se permite la transición ${actual.estado} → ${dto.estado}`);
    }
    return this.encuestas.updateState(surveyId, dto.estado);
  }

  getCriteria(surveyId: number) {
    return this.encuestas.findCriteria(surveyId);
  }

  updateSchedule(surveyId: number, horaApertura: string | null, horaCierre: string | null) {
    return this.encuestas.updateSchedule(surveyId, horaApertura, horaCierre);
  }

  getAssignments(surveyId: number) {
    return this.encuestas.getAssignments(surveyId);
  }

  updateAssignments(surveyId: number, equipoIds: number[], juecesIds: string[]) {
    return this.encuestas.updateAssignments(surveyId, equipoIds, juecesIds);
  }

  processScheduled(encuestaId?: number, competicionId?: number) {
    return this.encuestas.processScheduled(encuestaId, competicionId);
  }
}
