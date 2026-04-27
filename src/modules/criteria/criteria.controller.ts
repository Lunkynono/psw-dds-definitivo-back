import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateCriterionDto } from '../../shared/dto/criteria.dto';
import { CriteriaService } from './criteria.service';

@Controller()
export class CriteriaController {
  constructor(private readonly criteria: CriteriaService) {}

  @Get('competitions/:competitionId/criteria')
  list(@Param('competitionId') competitionId: string) {
    return this.criteria.list(Number(competitionId));
  }

  @Post('competitions/:competitionId/criteria')
  create(@Param('competitionId') competitionId: string, @Body() dto: CreateCriterionDto) {
    return this.criteria.create(Number(competitionId), dto);
  }

  @Patch('criteria/:criterionId')
  update(@Param('criterionId') criterionId: string, @Body() dto: CreateCriterionDto) {
    return this.criteria.update(Number(criterionId), dto);
  }

  @Delete('criteria/:criterionId')
  delete(@Param('criterionId') criterionId: string) {
    return this.criteria.delete(Number(criterionId));
  }
}
