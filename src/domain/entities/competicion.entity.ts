export class Competicion {
  constructor(
    public readonly id: number | null,
    public readonly eventoId: number,
    public nombre: string,
    public descripcion: string | null
  ) {}
}
