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
 *  - Si no se especifican `encuestaIds`, el juez queda asignado a TODAS las
 *    encuestas existentes de la competición (igual que en `CompeticionDetalle.jsx`).
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
   * propaga la asignación a todas las encuestas de la competición.
   */
  async assign(competitionId: number, dto: AssignJudgeDto) {
    const competition = await this.competiciones.findById(competitionId);
    const persona = await this.personas.findByCorreo(dto.correo);
    if (!persona) throw new Error('No existe ningún usuario registrado con ese correo');

    JudgeAssignmentPolicy.impedirOrganizadorComoJuez(competition.evento.organizador_id, persona.id);

    // Asignación a la competición — idempotente: ignoramos colisiones de PK
    const { error } = await this.supabase.from('competicion_juez').insert({
      competicion_id: competitionId,
      persona_id: persona.id
    });
    if (error && error.code !== '23505') throw error;

    // Si el cliente no eligió encuestas, propagamos a todas las de la competición
    let encuestaIds = dto.encuestaIds ?? [];
    if (encuestaIds.length === 0) {
      const todas = await this.encuestas.findByCompeticion(competitionId);
      encuestaIds = todas.map((encuesta: any) => encuesta.id);
    }

    if (encuestaIds.length > 0) {
      const { error: encuestaError } = await this.supabase.from('encuesta_juez').insert(
        encuestaIds.map((encuestaId) => ({ encuesta_id: encuestaId, persona_id: persona.id }))
      );
      if (encuestaError && encuestaError.code !== '23505') throw encuestaError;
    }

    return persona;
  }

  /** Elimina la asignación de un juez de una competición concreta. */
  async remove(competitionId: number, personId: string) {
    const { error } = await this.supabase
      .from('competicion_juez')
      .delete()
      .eq('competicion_id', competitionId)
      .eq('persona_id', personId);
    if (error) throw error;
  }
}
