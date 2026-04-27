import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ResultCalculationService } from './result-calculation.service';
import { UpdateManualScoreDto } from '../../shared/dto/result.dto';
import { ResultsFacade } from '../../shared/facades/results.facade';
import { PublicVotingService } from '../public-voting/public-voting.service';

@Controller()
export class ResultsController {
  constructor(
    private readonly results: ResultCalculationService,
    private readonly facade: ResultsFacade,
    private readonly publicVoting: PublicVotingService
  ) {}

  @Get('surveys/:surveyId/results')
  list(@Param('surveyId') surveyId: string) {
    return this.facade.getSurveyResults(Number(surveyId));
  }

  @Post('surveys/:surveyId/results/recalculate')
  recalculate(@Param('surveyId') surveyId: string) {
    return this.facade.recalculateSurveyResults(Number(surveyId));
  }

  @Patch('results/:resultId/manual-score')
  updateManual(@Param('resultId') resultId: string, @Body() dto: UpdateManualScoreDto) {
    return this.results.updateManualScore(Number(resultId), dto.puntajeManual);
  }

  @Get('surveys/:surveyId/comments')
  comments(@Param('surveyId') surveyId: string) {
    return this.results.getComments(Number(surveyId));
  }

  @Get('public/rooms/:code/results')
  async publicResults(@Param('code') code: string) {
    const room: any = await this.publicVoting.getRoom(code);
    return this.results.getLiveRanking(room.id);
  }
}
