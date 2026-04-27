export class Proyecto {
  constructor(
    public readonly id: number | null,
    public readonly equipoId: number,
    public nombre: string,
    public descripcion: string | null
  ) {}

  puedeSerEvaluado(): boolean {
    return this.nombre.trim().length > 0;
  }
}
