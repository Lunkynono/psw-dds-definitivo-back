import { Injectable } from '@nestjs/common';
import { JudgeAssignmentPolicy } from '../../domain/policies/judge-assignment.policy';
import { CompeticionRepository } from '../../infrastructure/repositories/competicion.repository';
import { EncuestaRepository } from '../../infrastructure/repositories/encuesta.repository';
import { PersonaRepository } from '../../infrastructure/repositories/persona.repository';
import { SupabaseAdapter } from '../../infrastructure/supabase/supabase.adapter';
import { AssignJudgeDto } from '../../shared/dto/judge.dto';

/**
 * Caso de uso "Asignación de jueces a una competición".
 *
 * Reglas migradas tal cual del monorepo original:
 *  - El juez se identifica por correo y debe existir previamente en `persona`.
 *  - El organizador del evento NO puede ser juez de su propia competición
 *    (lo aplica `JudgeAssignmentPolicy`).
 *  - Si no se especifican `encuestaIds`, o viene un array vacío, el juez queda
 *    asignado a la competición, pero no a ninguna encuesta concreta.
 *  - Las violaciones de unicidad (`23505`) se ignoran para que asignar a un juez
 *    ya existente sea idempotente.
 */
@Injectable()
export class JudgeAssignmentService {
  constructor(
    private readonly supabase: SupabaseAdapter,
    private readonly personas: PersonaRepository,
    private readonly competiciones: CompeticionRepository,
    private readonly encuestas: EncuestaRepository
  ) {}

  /** Devuelve los jueces asignados a una competición con sus datos de persona. */
  async list(competitionId: number) {
    const { data, error } = await this.supabase
      .from('competicion_juez')
      .select('persona_id, persona(*)')
      .eq('competicion_id', competitionId);
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Asigna a una persona como juez de una competición y, opcionalmente, de un
   * subconjunto concreto de sus encuestas. Si `encuestaIds` viene vacío, se
   * queda como juez disponible de la competición sin encuestas asignadas.
   */
  async assign(competitionId: number, dto: AssignJudgeDto) {
    const competition = await this.competiciones.findById(competitionId);
    const persona = await this.personas.findByCorreo(dto.correo.trim());
    if (!persona) throw new Error('Este correo no está registrado como juez');

    JudgeAssignmentPolicy.impedirOrganizadorComoJuez(competition.evento.organizador_id, persona.id);
    await this.ensureJudgeIsNotParticipant(competitionId, persona.correo);

    // Asignación a la competición — idempotente: ignoramos colisiones de PK
    const { error } = await this.supabase.from('competicion_juez').insert({
      competicion_id: competitionId,
      persona_id: persona.id
    });
    if (error && error.code !== '23505') throw error;

    const encuestaIds = Array.isArray(dto.encuestaIds)
      ? dto.encuestaIds.filter((encuestaId) => Number.isFinite(Number(encuestaId)))
      : [];

    if (encuestaIds.length > 0) {
      const { error: encuestaError } = await this.supabase
        .from('encuesta_juez')
        .upsert(
          encuestaIds.map((encuestaId) => ({ encuesta_id: encuestaId, persona_id: persona.id })),
          { onConflict: 'encuesta_id,persona_id', ignoreDuplicates: true }
        );
      if (encuestaError && encuestaError.code !== '23505') throw encuestaError;
    }

    return persona;
  }

  /** Elimina la asignación de un juez de una competición concreta. */
  private async ensureJudgeIsNotParticipant(competitionId: number, correo: string) {
    const { data, error } = await this.supabase
      .from('participante')
      .select('id, equipo!inner(competicion_id)')
      .ilike('correo', correo.trim())
      .eq('equipo.competicion_id', competitionId)
      .limit(1);
    if (error) throw error;
    if ((data ?? []).length > 0) {
      throw new Error('Un participante no puede ser juez de la misma competición');
    }
  }

  async remove(competitionId: number, personId: string) {
    const encuestas = await this.encuestas.findByCompeticion(competitionId);
    const encuestaIds = encuestas.map((encuesta: any) => encuesta.id);
    if (encuestaIds.length > 0) {
      const { error: encuestaError } = await this.supabase
        .from('encuesta_juez')
        .delete()
        .eq('persona_id', personId)
        .in('encuesta_id', encuestaIds);
      if (encuestaError) throw encuestaError;
    }

    const { error } = await this.supabase
      .from('competicion_juez')
      .delete()
      .eq('competicion_id', competitionId)
      .eq('persona_id', personId);
    if (error) throw error;
  }
}
