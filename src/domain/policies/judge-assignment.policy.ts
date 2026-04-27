/**
 * Policy de asignación de jueces a competiciones.
 *
 * Regla principal: el organizador del evento NO puede ser juez de su
 * propia competición (criterio funcional impuesto por la profesora en el
 * monorepo original).
 *
 * Modelarlo como Policy desacopla la regla del servicio: si en el futuro
 * añadimos más restricciones (por ejemplo, "el participante de un equipo
 * tampoco puede ser juez"), las añadimos aquí sin tocar el servicio.
 */
export class JudgeAssignmentPolicy {
  static impedirOrganizadorComoJuez(organizadorId: string, juezId: string): void {
    if (organizadorId === juezId) {
      throw new Error('El organizador no puede ser juez de su propia competición');
    }
  }
}
