import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { SubmitJudgeVoteDto } from '../../shared/dto/vote.dto';
import { VotingFacade } from '../../shared/facades/voting.facade';
import { JudgeVotingService } from './judge-voting.service';

@Controller('judge')
export class JudgeVotingController {
  constructor(
    private readonly voting: VotingFacade,
    private readonly judgeVoting: JudgeVotingService
  ) {}

  @Get('surveys')
  list(@Headers('x-user-id') userId: string) {
    return this.judgeVoting.listAssignedOpenSurveys(userId);
  }

  @Get('surveys/:surveyId/projects/:projectId/form')
  form(@Param('surveyId') surveyId: string, @Param('projectId') projectId: string) {
    return this.judgeVoting.getVotingForm(Number(surveyId), Number(projectId));
  }

  @Post('surveys/:surveyId/projects/:projectId/votes')
  submit(@Headers('x-user-id') userId: string, @Param('surveyId') surveyId: string, @Param('projectId') projectId: string, @Body() dto: SubmitJudgeVoteDto) {
    return this.voting.submitJudgeVote(userId, Number(surveyId), Number(projectId), dto);
  }
}
