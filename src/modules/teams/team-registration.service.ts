import { Injectable } from '@nestjs/common';
import { EquipoRepository } from '../../infrastructure/repositories/equipo.repository';
import { CreateTeamDto } from '../../shared/dto/team.dto';

@Injectable()
export class TeamRegistrationService {
  constructor(private readonly equipos: EquipoRepository) {}

  list(competitionId: number) {
    return this.equipos.findByCompeticion(competitionId);
  }

  createTeamWithProjectAndParticipants(competitionId: number, dto: CreateTeamDto) {
    return this.equipos.createTeamWithProjectAndParticipants({
      competicionId: competitionId,
      equipoNombre: dto.equipoNombre,
      proyecto: dto.proyecto,
      participantes: dto.participantes.map((p) => ({
        nombre: p.nombre,
        correo: p.correo ?? null,
        rol: p.rol ?? 'Sin asignar'
      }))
    });
  }

  update(teamId: number, dto: {
    nombre: string;
    proyectoId: number | null;
    proyectoNombre: string;
    proyectoDesc?: string | null;
    participantes: Array<{ id?: number; nombre: string; correo: string; rol: string }>;
  }) {
    return this.equipos.update(teamId, dto);
  }

  delete(teamId: number) {
    return this.equipos.delete(teamId);
  }
}
