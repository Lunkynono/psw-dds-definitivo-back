import { Injectable } from '@nestjs/common';
import { EquipoRepository } from '../../infrastructure/repositories/equipo.repository';
import { SupabaseAdapter } from '../../infrastructure/supabase/supabase.adapter';
import { CreateTeamDto } from '../../shared/dto/team.dto';

@Injectable()
export class TeamRegistrationService {
  constructor(
    private readonly equipos: EquipoRepository,
    private readonly supabase: SupabaseAdapter
  ) {}

  list(competitionId: number) {
    return this.equipos.findByCompeticion(competitionId);
  }

  async createTeamWithProjectAndParticipants(competitionId: number, dto: CreateTeamDto) {
    this.validateTeamPayload(dto.equipoNombre, dto.proyecto?.nombre, dto.participantes);
    await this.ensureParticipantsAreNotJudges(competitionId, dto.participantes);
    return this.equipos.createTeamWithProjectAndParticipants({
      competicionId: competitionId,
      equipoNombre: dto.equipoNombre.trim(),
      proyecto: {
        nombre: dto.proyecto.nombre.trim(),
        descripcion: dto.proyecto.descripcion?.trim() || null
      },
      participantes: dto.participantes.map((p) => ({
        nombre: p.nombre.trim(),
        correo: p.correo.trim(),
        rol: p.rol.trim()
      }))
    });
  }

  async update(teamId: number, dto: {
    nombre: string;
    proyectoId: number | null;
    proyectoNombre: string;
    proyectoDesc?: string | null;
    participantes: Array<{ id?: number; nombre: string; correo: string; rol: string }>;
  }) {
    this.validateTeamPayload(dto.nombre, dto.proyectoNombre, dto.participantes);
    const competitionId = await this.findCompetitionIdByTeam(teamId);
    await this.ensureParticipantsAreNotJudges(competitionId, dto.participantes);
    return this.equipos.update(teamId, {
      ...dto,
      nombre: dto.nombre.trim(),
      proyectoNombre: dto.proyectoNombre.trim(),
      proyectoDesc: dto.proyectoDesc?.trim() || null,
      participantes: dto.participantes.map((p) => ({
        id: p.id,
        nombre: p.nombre.trim(),
        correo: p.correo.trim(),
        rol: p.rol.trim()
      }))
    });
  }

  delete(teamId: number) {
    return this.equipos.delete(teamId);
  }

  private validateTeamPayload(
    equipoNombre: string | undefined,
    proyectoNombre: string | undefined,
    participantes: Array<{ nombre?: string; correo?: string; rol?: string }> = []
  ) {
    if (!equipoNombre?.trim() || !proyectoNombre?.trim()) {
      throw new Error('Nombre del equipo y proyecto son obligatorios');
    }
    if (participantes.length === 0) {
      throw new Error('Añade al menos un participante');
    }
    const incompleto = participantes.some((p) => !p.nombre?.trim() || !p.correo?.trim() || !p.rol?.trim());
    if (incompleto) {
      throw new Error('Nombre, correo y rol son obligatorios para cada participante');
    }
  }

  private async findCompetitionIdByTeam(teamId: number) {
    const { data, error } = await this.supabase
      .from('equipo')
      .select('competicion_id')
      .eq('id', teamId)
      .single();
    if (error) throw error;
    return Number(data.competicion_id);
  }

  private async ensureParticipantsAreNotJudges(
    competitionId: number,
    participantes: Array<{ correo?: string }>
  ) {
    const correos = participantes
      .map((p) => p.correo?.trim().toLowerCase())
      .filter((correo): correo is string => Boolean(correo));
    if (correos.length === 0) return;

    const { data, error } = await this.supabase
      .from('competicion_juez')
      .select('persona(correo)')
      .eq('competicion_id', competitionId);
    if (error) throw error;

    const correosJueces = new Set(
      (data ?? [])
        .map((row: any) => row.persona?.correo?.trim().toLowerCase())
        .filter(Boolean)
    );
    if (correos.some((correo) => correosJueces.has(correo))) {
      throw new Error('Un juez no puede participar en la misma competición');
    }
  }
}
