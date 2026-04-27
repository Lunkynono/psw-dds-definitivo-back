import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTeamDto } from '../../shared/dto/team.dto';
import { TeamRegistrationService } from './team-registration.service';

@Controller()
export class TeamController {
  constructor(private readonly teams: TeamRegistrationService) {}

  @Get('competitions/:competitionId/teams')
  list(@Param('competitionId') competitionId: string) {
    return this.teams.list(Number(competitionId));
  }

  @Post('competitions/:competitionId/teams')
  create(@Param('competitionId') competitionId: string, @Body() dto: CreateTeamDto) {
    return this.teams.createTeamWithProjectAndParticipants(Number(competitionId), dto);
  }

  @Patch('teams/:teamId')
  update(@Param('teamId') teamId: string, @Body() dto: any) {
    return this.teams.update(Number(teamId), dto);
  }

  @Delete('teams/:teamId')
  remove(@Param('teamId') teamId: string) {
    return this.teams.delete(Number(teamId));
  }
}
