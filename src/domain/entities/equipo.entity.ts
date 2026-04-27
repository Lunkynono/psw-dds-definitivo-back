export class Equipo {
  constructor(
    public readonly id: number | null,
    public readonly competicionId: number,
    public nombre: string
  ) {}
}
