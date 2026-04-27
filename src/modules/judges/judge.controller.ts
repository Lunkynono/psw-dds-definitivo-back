import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AssignJudgeDto } from '../../shared/dto/judge.dto';
import { JudgeAssignmentService } from './judge-assignment.service';

@Controller('competitions/:competitionId/judges')
export class JudgeController {
  constructor(private readonly judges: JudgeAssignmentService) {}

  @Get()
  list(@Param('competitionId') competitionId: string) {
    return this.judges.list(Number(competitionId));
  }

  @Post()
  assign(@Param('competitionId') competitionId: string, @Body() dto: AssignJudgeDto) {
    return this.judges.assign(Number(competitionId), dto);
  }

  @Delete(':personId')
  remove(@Param('competitionId') competitionId: string, @Param('personId') personId: string) {
    return this.judges.remove(Number(competitionId), personId);
  }
}
