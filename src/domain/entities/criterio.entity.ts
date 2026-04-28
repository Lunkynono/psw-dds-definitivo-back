export type CriterioTipo = 'numerico' | 'radio' | 'checklist' | 'rubrica' | 'comentario';

export interface CriterioOpcion {
  id?: number;
  criterioId?: number;
  texto: string;
  orden: number;
}

export abstract class Criterio {
  constructor(
    public readonly id: number | null,
    public readonly competicionId: number,
    public titulo: string,
    public descripcion: string | null,
    public tipo: CriterioTipo,
    public peso: number,
    public orden: number,
    public opciones: CriterioOpcion[] = []
  ) {}

  abstract validarRespuesta(respuesta: unknown): boolean;
}
