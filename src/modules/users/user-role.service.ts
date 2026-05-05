import { Injectable } from '@nestjs/common';
import { EventoRepository } from '../../infrastructure/repositories/evento.repository';
import { PersonaRepository } from '../../infrastructure/repositories/persona.repository';
import { ParticipantDashboardService } from '../participants/participant-dashboard.service';

export type UserRole = 'admin' | 'juez' | 'participante';

@Injectable()
export class UserRoleService {
  constructor(
    private readonly eventos: EventoRepository,
    private readonly personas: PersonaRepository,
    private readonly participants: ParticipantDashboardService
  ) {}

  async resolveRole(userId: string): Promise<UserRole> {
    const roles = await this.resolveRoles(userId);
    return roles[0] ?? 'juez';
  }

  async resolveRoles(userId: string): Promise<UserRole[]> {
    const roles: UserRole[] = [];

    const propios = await this.eventos.findByOrganizador(userId);
    if (propios.length > 0) roles.push('admin');

    const persona = await this.personas.findById(userId);
    const esParticipante = !!(persona?.correo && await this.participants.hasParticipantByCorreo(persona.correo));

    if (esParticipante) {
      roles.push('participante');
    } else {
      roles.push('juez');
    }

    return roles;
  }
}
