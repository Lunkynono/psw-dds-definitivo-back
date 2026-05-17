import { Injectable } from '@nestjs/common';
import { PremioRepository } from '../../infrastructure/repositories/premio.repository';
import { CreateAwardDto, UpdateAwardDto } from '../../shared/dto/award.dto';

@Injectable()
export class AwardService {
  constructor(private readonly premios: PremioRepository) {}

  listByEvent(eventId: number) {
    return this.premios.findByEvento(eventId);
  }

  listByCompetition(competitionId: number) {
    return this.premios.findByCompeticion(competitionId);
  }

  createForEvent(eventId: number, dto: CreateAwardDto) {
    return this.premios.create({
      evento_id: eventId,
      competicion_id: null,
      tipo: dto.tipo,
      descripcion: dto.descripcion.trim(),
      posicion: dto.posicion,
      condiciones_entrega: dto.condicionesEntrega?.trim() || null
    });
  }

  createForCompetition(competitionId: number, dto: CreateAwardDto) {
    return this.premios.create({
      evento_id: null,
      competicion_id: competitionId,
      tipo: dto.tipo,
      descripcion: dto.descripcion.trim(),
      posicion: dto.posicion,
      condiciones_entrega: dto.condicionesEntrega?.trim() || null
    });
  }

  update(awardId: number, dto: UpdateAwardDto) {
    const payload: Record<string, unknown> = {};
    if (dto.tipo !== undefined) payload.tipo = dto.tipo;
    if (dto.descripcion !== undefined) payload.descripcion = dto.descripcion.trim();
    if (dto.posicion !== undefined) payload.posicion = dto.posicion;
    if (dto.condicionesEntrega !== undefined) {
      payload.condiciones_entrega = dto.condicionesEntrega?.trim() || null;
    }
    return this.premios.update(awardId, payload);
  }

  delete(awardId: number) {
    return this.premios.delete(awardId);
  }
}
