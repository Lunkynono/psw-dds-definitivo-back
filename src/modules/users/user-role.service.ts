import { Injectable } from '@nestjs/common';
import { EventoRepository } from '../../infrastructure/repositories/evento.repository';

export type UserRole = 'admin' | 'juez';

@Injectable()
export class UserRoleService {
  constructor(private readonly eventos: EventoRepository) {}

  async resolveRole(userId: string): Promise<UserRole> {
    const propios = await this.eventos.findByOrganizador(userId);
    return propios.length > 0 ? 'admin' : 'juez';
  }
}
