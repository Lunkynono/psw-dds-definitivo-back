import { Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { AiSummaryService } from './ai-summary.service';

@Controller('surveys/:surveyId/ai-summaries')
export class AiSummaryController {
  private readonly logger = new Logger(AiSummaryController.name);

  constructor(private readonly summaries: AiSummaryService) {}

  @Get()
  list(@Param('surveyId') surveyId: string) {
    return this.summaries.listBySurvey(Number(surveyId));
  }

  @Post('generate')
  generate(@Param('surveyId') surveyId: string) {
    this.logger.log(JSON.stringify({
      endpoint: 'POST /surveys/:surveyId/ai-summaries/generate',
      surveyId: Number(surveyId),
      nodeEnv: process.env.NODE_ENV ?? null
    }));
    return this.summaries.generateForSurvey(Number(surveyId));
  }
}
