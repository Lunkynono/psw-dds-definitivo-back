import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './modules/auth/auth.controller';
import { CompetitionController } from './modules/competitions/competition.controller';
import { CriteriaController } from './modules/criteria/criteria.controller';
import { EventController } from './modules/events/event.controller';
import { JudgeController } from './modules/judges/judge.controller';
import { JudgeVotingController } from './modules/voting/judge-voting.controller';
import { PublicVotingController } from './modules/public-voting/public-voting.controller';
import { ResultsController } from './modules/results/results.controller';
import { SurveyController } from './modules/surveys/survey.controller';
import { TeamController } from './modules/teams/team.controller';
import { AuthService } from './modules/auth/auth.service';
import { UserRoleService } from './modules/users/user-role.service';
import { CompetitionService } from './modules/competitions/competition.service';
import { CriteriaService } from './modules/criteria/criteria.service';
import { EventService } from './modules/events/event.service';
import { JudgeAssignmentService } from './modules/judges/judge-assignment.service';
import { PublicVotingService } from './modules/public-voting/public-voting.service';
import { ResultCalculationService } from './modules/results/result-calculation.service';
import { SurveyService } from './modules/surveys/survey.service';
import { TeamRegistrationService } from './modules/teams/team-registration.service';
import { JudgeVotingService } from './modules/voting/judge-voting.service';
import { CompetitionFacade } from './shared/facades/competition.facade';
import { ResultsFacade } from './shared/facades/results.facade';
import { VotingFacade } from './shared/facades/voting.facade';
import { SupabaseAdapter } from './infrastructure/supabase/supabase.adapter';
import { SupabaseClientSingleton } from './infrastructure/supabase/supabase-client.singleton';
import { CompeticionRepository } from './infrastructure/repositories/competicion.repository';
import { CriterioRepository } from './infrastructure/repositories/criterio.repository';
import { EncuestaRepository } from './infrastructure/repositories/encuesta.repository';
import { EquipoRepository } from './infrastructure/repositories/equipo.repository';
import { EventoRepository } from './infrastructure/repositories/evento.repository';
import { PersonaRepository } from './infrastructure/repositories/persona.repository';
import { ResultadoRepository } from './infrastructure/repositories/resultado.repository';
import { VotoPublicoRepository } from './infrastructure/repositories/voto-publico.repository';
import { VotoRepository } from './infrastructure/repositories/voto.repository';
import { VoterHashService } from './shared/utils/voter-hash.service';
import { SurveyCodeGenerator } from './shared/utils/survey-code.generator';
import { ResultScoreCalculator } from './domain/services/result-score.calculator';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [
    AuthController,
    EventController,
    CompetitionController,
    TeamController,
    CriteriaController,
    SurveyController,
    JudgeController,
    JudgeVotingController,
    PublicVotingController,
    ResultsController
  ],
  providers: [
    SupabaseClientSingleton,
    SupabaseAdapter,
    PersonaRepository,
    EventoRepository,
    CompeticionRepository,
    EquipoRepository,
    CriterioRepository,
    EncuestaRepository,
    VotoRepository,
    VotoPublicoRepository,
    ResultadoRepository,
    AuthService,
    UserRoleService,
    EventService,
    CompetitionService,
    TeamRegistrationService,
    CriteriaService,
    SurveyService,
    JudgeAssignmentService,
    JudgeVotingService,
    PublicVotingService,
    ResultCalculationService,
    CompetitionFacade,
    VotingFacade,
    ResultsFacade,
    VoterHashService,
    SurveyCodeGenerator,
    ResultScoreCalculator
  ]
})
export class AppModule {}
