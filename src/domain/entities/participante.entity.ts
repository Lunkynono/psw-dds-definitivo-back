export class Participante {
  constructor(
    public readonly id: number | null,
    public readonly equipoId: number,
    public nombre: string,
    public correo: string | null
  ) {}
}
