export interface RespuestaCriterio {
  criterioId: number;
  valorNumerico?: number | null;
  opcionesIds?: number[] | null;
  valorTexto?: string | null;
}

export class VotoJuez {
  constructor(
    public readonly encuestaId: number,
    public readonly proyectoId: number,
    public readonly voterHash: string,
    public readonly respuestas: RespuestaCriterio[]
  ) {}
}

export class VotoPublico {
  constructor(
    public readonly encuestaId: number,
    public readonly proyectoId: number,
    public readonly correoVotante: string,
    public readonly respuestas: RespuestaCriterio[]
  ) {}
}
