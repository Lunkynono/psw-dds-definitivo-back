export class Evento {
  constructor(
    public readonly id: number | null,
    public readonly organizadorId: string,
    public nombre: string,
    public lugar: string | null,
    public descripcion: string | null,
    public readonly createdAt?: string
  ) {}

  perteneceA(userId: string): boolean {
    return this.organizadorId === userId;
  }
}
