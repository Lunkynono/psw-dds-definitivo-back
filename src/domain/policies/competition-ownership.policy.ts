export class CompetitionOwnershipPolicy {
  static exigirPropietario(organizadorId: string, userId: string): void {
    if (organizadorId !== userId) {
      throw new Error('No tienes permisos para gestionar esta competición');
    }
  }
}
