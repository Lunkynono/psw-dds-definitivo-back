export type EncuestaEstado = 'borrador' | 'abierta' | 'programada' | 'cerrada';
export type TipoVotante = 'juez' | 'publico' | 'ambos';

export class Encuesta {
  constructor(
    public readonly id: number | null,
    public readonly competicionId: number,
    public nombre: string,
    public descripcion: string | null,
    public tipoVotante: TipoVotante,
    public peso: number,
    public creadorId: string,
    public estado: EncuestaEstado,
    public codigoSala: string | null,
    public horaApertura: string | null = null,
    public horaCierre: string | null = null,
    public horaReapertura: string | null = null
  ) {}

  estaAbierta(): boolean {
    return this.estado === 'abierta';
  }
}
