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
    const perfil = data.user
      ? await this.personas.upsert({ id: data.user.id, nombre: dto.nombre, correo: dto.correo })
      : null;
    return { ...data, perfil };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth().signInWithPassword({
      email: dto.correo,
      password: dto.password
    });
    if (error) throw error;
    const nombre = data.user?.user_metadata?.nombre ?? dto.correo.split('@')[0];
    const perfil = data.user
      ? (await this.personas.findById(data.user.id)) ??
        (await this.personas.upsert({ id: data.user.id, nombre, correo: dto.correo }))
      : null;
    const roles = data.user ? await this.roles.resolveRoles(data.user.id) : [];
    return { session: data.session, user: data.user, perfil, roles };
  }

  async me(userId: string) {
    const perfil = await this.personas.findById(userId);
    const roles = await this.roles.resolveRoles(userId);
    return { perfil, roles };
  }
}
