import { Injectable } from '@nestjs/common';
import { PublicVotingService } from '../../modules/public-voting/public-voting.service';
import { JudgeVotingService } from '../../modules/voting/judge-voting.service';
import { SubmitJudgeVoteDto, SubmitPublicVoteDto } from '../dto/vote.dto';

/**
 * Facade del backend para la "votación".
 *
 * Centraliza la entrada al sistema de votos para que los controllers no
 * tengan que conocer si un voto es de jurado o de público; toda decisión
 * de routing entre los dos servicios vive aquí.
 */
@Injectable()
export class VotingFacade {
  constructor(
    private readonly judgeVoting: JudgeVotingService,
    private readonly publicVoting: PublicVotingService
  ) {}

  /** Submite el voto del jurado para un proyecto concreto. */
  submitJudgeVote(userId: string, surveyId: number, projectId: number, dto: SubmitJudgeVoteDto) {
    return this.judgeVoting.submit(userId, surveyId, projectId, dto);
  }

  /** Submite el voto del público (un voto por proyecto en una sala). */
  submitPublicVote(code: string, dto: SubmitPublicVoteDto) {
    return this.publicVoting.submit(code, dto);
  }
}
