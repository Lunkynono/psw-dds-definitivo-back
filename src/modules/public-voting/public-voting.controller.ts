import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IdentifyPublicVoterDto, SubmitPublicVoteDto } from '../../shared/dto/vote.dto';
import { PublicVotingService } from './public-voting.service';
import { VotingFacade } from '../../shared/facades/voting.facade';

@Controller('public/rooms/:code')
export class PublicVotingController {
  constructor(
    private readonly publicVoting: PublicVotingService,
    private readonly voting: VotingFacade
  ) {}

  @Get()
  room(@Param('code') code: string) {
    return this.publicVoting.getRoom(code);
  }

  @Get('form')
  form(@Param('code') code: string) {
    return this.publicVoting.getVotingForm(code);
  }

  @Post('identify')
  identify(@Param('code') code: string, @Body() dto: IdentifyPublicVoterDto) {
    return this.publicVoting.identify(code, dto);
  }

  @Post('votes')
  submit(@Param('code') code: string, @Body() dto: SubmitPublicVoteDto) {
    return this.voting.submitPublicVote(code, dto);
  }
}
