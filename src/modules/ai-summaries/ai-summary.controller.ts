import { Controller, Get, Param, Post } from '@nestjs/common';
import { AiSummaryService } from './ai-summary.service';

@Controller('surveys/:surveyId/ai-summaries')
export class AiSummaryController {
  constructor(private readonly summaries: AiSummaryService) {}

  @Get()
  list(@Param('surveyId') surveyId: string) {
    return this.summaries.listBySurvey(Number(surveyId));
  }

  @Post('generate')
  generate(@Param('surveyId') surveyId: string) {
    return this.summaries.generateForSurvey(Number(surveyId));
  }
}
