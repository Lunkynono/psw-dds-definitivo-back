import { Criterio } from '../../entities/criterio.entity';

export class CriterioNumerico extends Criterio {
  constructor(
    id: number | null,
    competicionId: number,
    titulo: string,
    descripcion: string | null,
    peso: number,
    orden: number,
    public readonly rangoMin: number | null,
    public readonly rangoMax: number | null
  ) {
    super(id, competicionId, titulo, descripcion, 'numerico', peso, orden);
  }

  validarRespuesta(respuesta: unknown): boolean {
    if (respuesta === null || respuesta === undefined || respuesta === '') return true;
    const valor = Number(respuesta);
    if (Number.isNaN(valor)) return false;
    if (this.rangoMin !== null && valor < this.rangoMin) return false;
    if (this.rangoMax !== null && valor > this.rangoMax) return false;
    return true;
  }
}
