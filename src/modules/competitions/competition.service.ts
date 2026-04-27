import { Injectable } from '@nestjs/common';
import { CompeticionRepository } from '../../infrastructure/repositories/competicion.repository';
import { CreateCompetitionDto, UpdateCompetitionDto } from '../../shared/dto/competition.dto';

@Injectable()
export class CompetitionService {
  constructor(private readonly competiciones: CompeticionRepository) {}

  listByEvent(eventId: number) {
    return this.competiciones.findByEvento(eventId);
  }

  get(competitionId: number) {
    return this.competiciones.findById(competitionId);
  }

  create(eventId: number, dto: CreateCompetitionDto) {
    return this.competiciones.create({
      evento_id: eventId,
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null
    });
  }

  update(competitionId: number, dto: UpdateCompetitionDto) {
    return this.competiciones.update(competitionId, { ...dto });
  }
}
