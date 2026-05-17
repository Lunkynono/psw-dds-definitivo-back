import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AwardService } from './award.service';
import { CreateAwardDto, UpdateAwardDto } from '../../shared/dto/award.dto';

@Controller()
export class AwardController {
  constructor(private readonly awards: AwardService) {}

  @Get('events/:eventId/awards')
  listEventAwards(@Param('eventId') eventId: string) {
    return this.awards.listByEvent(Number(eventId));
  }

  @Post('events/:eventId/awards')
  createEventAward(@Param('eventId') eventId: string, @Body() dto: CreateAwardDto) {
    return this.awards.createForEvent(Number(eventId), dto);
  }

  @Get('competitions/:competitionId/awards')
  listCompetitionAwards(@Param('competitionId') competitionId: string) {
    return this.awards.listByCompetition(Number(competitionId));
  }

  @Post('competitions/:competitionId/awards')
  createCompetitionAward(@Param('competitionId') competitionId: string, @Body() dto: CreateAwardDto) {
    return this.awards.createForCompetition(Number(competitionId), dto);
  }

  @Patch('awards/:awardId')
  updateAward(@Param('awardId') awardId: string, @Body() dto: UpdateAwardDto) {
    return this.awards.update(Number(awardId), dto);
  }

  @Delete('awards/:awardId')
  deleteAward(@Param('awardId') awardId: string) {
    return this.awards.delete(Number(awardId));
  }
}
