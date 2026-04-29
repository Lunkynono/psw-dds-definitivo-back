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
    const criterioIds = await this.criterios.ensureCommentCriterion(competitionId, dto.criterioIds ?? []);
    if (criterioIds.length === 0) {
      throw new Error('Selecciona al menos un criterio');
    }

    const estadoEncuesta = dto.estado === 'borrador' ? 'borrador' : dto.horaApertura ? 'programada' : 'abierta';
    const horaAperturaReal = estadoEncuesta === 'abierta' ? new Date().toISOString() : dto.horaApertura ?? null;

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
      throw new Error(`No se puede cambiar la encuesta de ${actual.estado} a ${dto.estado}`);
    }
    if (actual.estado === 'borrador' && ['abierta', 'programada'].includes(dto.estado)) {
      await this.validateReadyToPublish(surveyId);
    }
    return this.encuestas.updateState(surveyId, dto.estado);
  }

  getCriteria(surveyId: number) {
    return this.encuestas.findCriteria(surveyId);
  }

  async updateSchedule(surveyId: number, horaApertura: string | null, horaCierre: string | null) {
    const actual = await this.encuestas.findById(surveyId);
    if (actual.estado === 'borrador') {
      await this.validateReadyToPublish(surveyId);
    }
    return this.encuestas.updateSchedule(surveyId, horaApertura, horaCierre);
  }

  getAssignments(surveyId: number) {
    return this.encuestas.getAssignments(surveyId);
  }

  async updateAssignments(surveyId: number, equipoIds: number[], juecesIds: string[]) {
    const encuesta = await this.encuestas.findById(surveyId);
    return this.encuestas.updateAssignments(
      surveyId,
      equipoIds,
      encuesta.tipo_votante === 'publico' ? [] : juecesIds
    );
  }

  processScheduled(encuestaId?: number, competicionId?: number) {
    return this.encuestas.processScheduled(encuestaId, competicionId);
  }

  delete(surveyId: number) {
    return this.encuestas.deleteRemovable(surveyId);
  }

  private async validateReadyToPublish(surveyId: number) {
    const [encuesta, criterios, asignaciones] = await Promise.all([
      this.encuestas.findById(surveyId),
      this.encuestas.findCriteria(surveyId),
      this.encuestas.getAssignments(surveyId)
    ]);

    if (criterios.length === 0) {
      throw new Error('Selecciona al menos un criterio antes de publicar');
    }
    if (asignaciones.equiposAsignados.length === 0) {
      throw new Error('Selecciona al menos un equipo antes de publicar');
    }
    if (['juez', 'ambos'].includes(encuesta.tipo_votante) && asignaciones.juecesAsignados.length === 0) {
      throw new Error('Selecciona al menos un jurado antes de publicar');
    }
  }
}
