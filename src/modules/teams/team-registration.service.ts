import { Injectable } from '@nestjs/common';
import { EquipoRepository } from '../../infrastructure/repositories/equipo.repository';
import { SupabaseAdapter } from '../../infrastructure/supabase/supabase.adapter';
import { CreateTeamDto } from '../../shared/dto/team.dto';

const PROJECT_FILES_BUCKET = 'proyectos';
const MAX_PROJECT_FILE_BYTES = 50 * 1024 * 1024;

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
    const created = await this.equipos.createTeamWithProjectAndParticipants({
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

    if (dto.proyecto.archivo) {
      created.proyecto = await this.uploadProjectFile(created.proyecto.id, dto.proyecto.archivo);
    }

    return created;
  }

  async update(teamId: number, dto: {
    nombre: string;
    proyectoId: number | null;
    proyectoNombre: string;
    proyectoDesc?: string | null;
    archivo?: { nombre: string; tipo: string; tamano: number; base64: string };
    eliminarArchivo?: boolean;
    participantes: Array<{ id?: number; nombre: string; correo: string; rol: string }>;
  }) {
    this.validateTeamPayload(dto.nombre, dto.proyectoNombre, dto.participantes);
    const competitionId = await this.findCompetitionIdByTeam(teamId);
    await this.ensureParticipantsAreNotJudges(competitionId, dto.participantes);
    const updated = await this.equipos.update(teamId, {
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

    const proyectoId = updated.proyectoId;
    if (proyectoId && (dto.eliminarArchivo || dto.archivo)) {
      await this.removeStoredProjectFile(proyectoId);
    }
    if (proyectoId && dto.archivo) {
      await this.uploadProjectFile(proyectoId, dto.archivo);
    }

    return updated;
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

  private async uploadProjectFile(
    proyectoId: number,
    archivo: { nombre: string; tipo: string; tamano: number; base64: string }
  ) {
    if (!archivo.nombre?.trim() || !archivo.base64) {
      throw new Error('El archivo del proyecto no es valido');
    }
    if (archivo.tamano > MAX_PROJECT_FILE_BYTES) {
      throw new Error('El archivo del proyecto no puede superar 50 MB');
    }

    const buffer = Buffer.from(archivo.base64, 'base64');
    const extension = this.extensionFromName(archivo.nombre);
    const filePath = `${proyectoId}/${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
    const contentType = archivo.tipo || 'application/octet-stream';

    const { error } = await this.supabase.storage()
      .from(PROJECT_FILES_BUCKET)
      .upload(filePath, buffer, { contentType, cacheControl: '3600', upsert: false });

    if (error) {
      const msg = `${error.message || ''} ${(error as any).name || ''}`.toLowerCase();
      if (msg.includes('bucket') && msg.includes('not found')) {
        throw new Error('No existe el bucket "proyectos" en Supabase Storage. Crealo como bucket publico y vuelve a intentarlo.');
      }
      throw error;
    }

    const { data } = this.supabase.storage().from(PROJECT_FILES_BUCKET).getPublicUrl(filePath);
    return this.equipos.updateProjectFile(proyectoId, {
      url: data.publicUrl,
      nombre: archivo.nombre.trim(),
      tipo: contentType,
      tamano: archivo.tamano,
      path: filePath
    });
  }

  private async removeStoredProjectFile(proyectoId: number) {
    const projectFile = await this.equipos.findProjectFile(proyectoId);
    if (projectFile?.archivo_path) {
      const { error } = await this.supabase.storage()
        .from(PROJECT_FILES_BUCKET)
        .remove([projectFile.archivo_path]);
      if (error) throw error;
    }
    await this.equipos.clearProjectFile(proyectoId);
  }

  private extensionFromName(name: string) {
    const clean = name.trim().toLowerCase();
    const match = clean.match(/\.([a-z0-9]{1,12})$/);
    return match ? `.${match[1]}` : '';
  }
}
