import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseAdapter } from '../../infrastructure/supabase/supabase.adapter';

@Injectable()
export class ParticipantDashboardService {
  constructor(private readonly supabase: SupabaseAdapter) {}

  async getByUser(userId: string) {
    const { data: persona, error } = await this.supabase
      .from('persona')
      .select('correo')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!persona?.correo) throw new NotFoundException('No se encontro el perfil del usuario');

    const participante = await this.findParticipantByCorreo(persona.correo);
    if (!participante) throw new NotFoundException('No hay participante asociado a este correo');
    return this.buildDashboard(participante.id);
  }

  async getByCorreo(correo: string) {
    if (!correo?.trim()) throw new NotFoundException('Introduce un correo de participante');
    const participante = await this.findParticipantByCorreo(correo.trim());
    if (!participante) throw new NotFoundException('No hay participante asociado a este correo');
    return this.buildDashboard(participante.id);
  }

  async getById(participantId: number) {
    return this.buildDashboard(participantId);
  }

  async update(participantId: number, dto: { nombre?: string; correo?: string; rol?: string | null }) {
    const payload: Record<string, unknown> = {};
    if (dto.nombre !== undefined) payload.nombre = dto.nombre;
    if (dto.correo !== undefined) payload.correo = dto.correo;
    if (dto.rol !== undefined) payload.rol = dto.rol;

    const { error } = await this.supabase
      .from('participante')
      .update(payload)
      .eq('id', participantId);
    if (error) throw error;

    return this.buildDashboard(participantId);
  }

  async hasParticipantByCorreo(correo: string) {
    const participante = await this.findParticipantByCorreo(correo);
    return Boolean(participante);
  }

  private async findParticipantByCorreo(correo: string) {
    const { data, error } = await this.supabase
      .from('participante')
      .select('id')
      .ilike('correo', correo)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  private async buildDashboard(participantId: number) {
    const { data: participante, error } = await this.supabase
      .from('participante')
      .select('*, equipo(*, competicion(*, evento(*)), proyecto(*), participante(*))')
      .eq('id', participantId)
      .maybeSingle();
    if (error) throw error;
    if (!participante) throw new NotFoundException('Participante no encontrado');

    const competicionId = participante.equipo?.competicion_id;
    const equipoId = participante.equipo_id;
    const [{ data: encuestas }, { data: jueces }] = await Promise.all([
      competicionId && equipoId
        ? this.supabase
            .from('encuesta')
            .select('id, nombre, estado, tipo_votante, hora_apertura, hora_reapertura, hora_cierre, encuesta_equipo!left(equipo_id)')
            .eq('competicion_id', competicionId)
        : Promise.resolve({ data: [] }),
      competicionId
        ? this.supabase
            .from('competicion_juez')
            .select('persona_id, persona(nombre, correo)')
            .eq('competicion_id', competicionId)
        : Promise.resolve({ data: [] })
    ]);

    const encuestasEquipo = (encuestas ?? []).filter((encuesta: any) => {
      const asignaciones = encuesta.encuesta_equipo ?? [];
      return asignaciones.length === 0 || asignaciones.some((row: any) => row.equipo_id === equipoId);
    });

    return {
      participante,
      equipo: participante.equipo,
      proyecto: participante.equipo?.proyecto?.[0] ?? null,
      proyectos: participante.equipo?.proyecto ?? [],
      competicion: participante.equipo?.competicion ?? null,
      evento: participante.equipo?.competicion?.evento ?? null,
      companeros: (participante.equipo?.participante ?? []).filter((p: any) => p.id !== participante.id),
      encuestas: encuestasEquipo,
      jueces: jueces ?? [],
      estadoParticipacion: participante.equipo?.proyecto?.length ? 'Proyecto asignado' : 'Pendiente de proyecto'
    };
  }
}
