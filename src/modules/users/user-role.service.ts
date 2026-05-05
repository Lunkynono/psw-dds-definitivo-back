import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../infrastructure/supabase/supabase.adapter';
import { EventoRepository } from '../../infrastructure/repositories/evento.repository';
import { PersonaRepository } from '../../infrastructure/repositories/persona.repository';
import { ParticipantDashboardService } from '../participants/participant-dashboard.service';

export type UserRole = 'admin' | 'juez' | 'participante';

@Injectable()
export class UserRoleService {
  constructor(
    private readonly supabase: SupabaseAdapter,
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

    const [propios, judgeRows] = await Promise.all([
      this.eventos.findByOrganizador(userId),
      this.supabase.from('competicion_juez').select('persona_id').eq('persona_id', userId).limit(1)
    ]);

    if (propios.length > 0) roles.push('admin');
    if ((judgeRows.data?.length ?? 0) > 0) roles.push('juez');

    const persona = await this.personas.findById(userId);
    const esParticipante = !!(persona?.correo && await this.participants.hasParticipantByCorreo(persona.correo));
    if (esParticipante) roles.push('participante');

    return roles;
  }
}
