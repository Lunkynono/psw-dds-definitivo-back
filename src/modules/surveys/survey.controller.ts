import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateSurveyDto, UpdateSurveyAssignmentsDto, UpdateSurveyScheduleDto, UpdateSurveyStateDto } from '../../shared/dto/survey.dto';
import { SurveyService } from './survey.service';

@Controller()
export class SurveyController {
  constructor(private readonly surveys: SurveyService) {}

  @Get('competitions/:competitionId/surveys')
  list(@Param('competitionId') competitionId: string) {
    return this.surveys.list(Number(competitionId));
  }

  @Post('competitions/:competitionId/surveys')
  create(@Headers('x-user-id') userId: string, @Param('competitionId') competitionId: string, @Body() dto: CreateSurveyDto) {
    return this.surveys.create(Number(competitionId), userId, dto);
  }

  @Get('surveys/:surveyId')
  get(@Param('surveyId') surveyId: string) {
    return this.surveys.get(Number(surveyId));
  }

  @Patch('surveys/:surveyId/state')
  updateState(@Param('surveyId') surveyId: string, @Body() dto: UpdateSurveyStateDto) {
    return this.surveys.updateState(Number(surveyId), dto);
  }

  @Patch('surveys/:surveyId/schedule')
  updateSchedule(@Param('surveyId') surveyId: string, @Body() dto: UpdateSurveyScheduleDto) {
    return this.surveys.updateSchedule(
      Number(surveyId),
      dto.horaApertura ?? null,
      dto.horaCierre ?? null
    );
  }

  @Get('surveys/:surveyId/criteria')
  getCriteria(@Param('surveyId') surveyId: string) {
    return this.surveys.getCriteria(Number(surveyId));
  }

  @Get('surveys/:surveyId/assignments')
  getAssignments(@Param('surveyId') surveyId: string) {
    return this.surveys.getAssignments(Number(surveyId));
  }

  @Patch('surveys/:surveyId/assignments')
  updateAssignments(@Param('surveyId') surveyId: string, @Body() dto: UpdateSurveyAssignmentsDto) {
    return this.surveys.updateAssignments(Number(surveyId), dto.equipoIds, dto.juecesIds);
  }

  @Post('surveys/:surveyId/process-scheduled')
  processScheduled(
    @Param('surveyId') surveyId: string,
    @Query('competicionId') competicionId?: string
  ) {
    return this.surveys.processScheduled(
      surveyId !== 'all' ? Number(surveyId) : undefined,
      competicionId ? Number(competicionId) : undefined
    );
  }
}
