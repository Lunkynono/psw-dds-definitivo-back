import { Injectable } from '@nestjs/common';
import { SupabaseAdapter } from '../../infrastructure/supabase/supabase.adapter';
import { LoginDto, RegisterDto } from '../../shared/dto/auth.dto';
import { PersonaRepository } from '../../infrastructure/repositories/persona.repository';
import { UserRoleService } from '../users/user-role.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseAdapter,
    private readonly personas: PersonaRepository,
    private readonly roles: UserRoleService
  ) {}

  async register(dto: RegisterDto) {
    const { data, error } = await this.supabase.auth().signUp({
      email: dto.correo,
      password: dto.password,
      options: { data: { nombre: dto.nombre } }
    });
    if (error) throw error;
    return data;
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth().signInWithPassword({
      email: dto.correo,
      password: dto.password
    });
    if (error) throw error;
    const perfil = data.user ? await this.personas.findById(data.user.id) : null;
    const rol = data.user ? await this.roles.resolveRole(data.user.id) : null;
    return { session: data.session, user: data.user, perfil, rol };
  }

  async me(userId: string) {
    const perfil = await this.personas.findById(userId);
    const rol = await this.roles.resolveRole(userId);
    return { perfil, rol };
  }
}
