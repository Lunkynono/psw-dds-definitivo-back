import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CompetitionFacade } from '../../shared/facades/competition.facade';
import { CreateCompetitionDto, UpdateCompetitionDto } from '../../shared/dto/competition.dto';
import { CompetitionService } from './competition.service';

@Controller()
export class CompetitionController {
  constructor(
    private readonly competitions: CompetitionService,
    private readonly facade: CompetitionFacade
  ) {}

  @Get('events/:eventId/competitions')
  list(@Param('eventId') eventId: string) {
    return this.competitions.listByEvent(Number(eventId));
  }

  @Post('events/:eventId/competitions')
  create(@Param('eventId') eventId: string, @Body() dto: CreateCompetitionDto) {
    return this.competitions.create(Number(eventId), dto);
  }

  @Get('competitions/:competitionId')
  get(@Param('competitionId') competitionId: string) {
    return this.competitions.get(Number(competitionId));
  }

  @Get('competitions/:competitionId/management')
  management(@Param('competitionId') competitionId: string) {
    return this.facade.getManagementSummary(Number(competitionId));
  }

  @Get('competitions/:competitionId/survey-form')
  surveyForm(@Param('competitionId') competitionId: string) {
    return this.facade.getSurveyFormData(Number(competitionId));
  }

  @Patch('competitions/:competitionId')
  update(@Param('competitionId') competitionId: string, @Body() dto: UpdateCompetitionDto) {
    return this.competitions.update(Number(competitionId), dto);
  }
}
