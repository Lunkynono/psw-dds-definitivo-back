import { Injectable } from '@nestjs/common';
import { CompetitionService } from '../../modules/competitions/competition.service';
import { CriteriaService } from '../../modules/criteria/criteria.service';
import { JudgeAssignmentService } from '../../modules/judges/judge-assignment.service';
import { SurveyService } from '../../modules/surveys/survey.service';
import { TeamRegistrationService } from '../../modules/teams/team-registration.service';

@Injectable()
export class CompetitionFacade {
  constructor(
    private readonly competitions: CompetitionService,
    private readonly teams: TeamRegistrationService,
    private readonly criteria: CriteriaService,
    private readonly surveys: SurveyService,
    private readonly judges: JudgeAssignmentService
  ) {}

  async getManagementSummary(competitionId: number) {
    const [competition, teams, criteria, surveys, judges] = await Promise.all([
      this.competitions.get(competitionId),
      this.teams.list(competitionId),
      this.criteria.list(competitionId),
      this.surveys.list(competitionId),
      this.judges.list(competitionId)
    ]);

    return { competition, teams, criteria, surveys, judges };
  }

  /** Devuelve equipos y jueces disponibles para configurar una nueva encuesta. */
  async getSurveyFormData(competitionId: number) {
    const [teams, judges] = await Promise.all([
      this.teams.list(competitionId),
      this.judges.list(competitionId)
    ]);
    return {
      equipos: teams,
      jueces: judges.map((judge: any) => ({
        id: judge.persona_id,
        nombre: judge.persona?.nombre ?? '',
        correo: judge.persona?.correo ?? ''
      }))
    };
  }
}
