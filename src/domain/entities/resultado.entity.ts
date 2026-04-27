export class Resultado {
  constructor(
    public readonly id: number | null,
    public readonly encuestaId: number,
    public readonly proyectoId: number,
    public puntajeCalculado: number,
    public puntajeManual: number | null,
    public posicionFinal: number
  ) {}

  puntajeVisible(): number {
    return this.puntajeManual ?? this.puntajeCalculado;
  }
}
