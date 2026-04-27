import { Criterio, CriterioOpcion } from '../../entities/criterio.entity';

export class CriterioChecklist extends Criterio {
  constructor(
    id: number | null,
    competicionId: number,
    titulo: string,
    descripcion: string | null,
    peso: number,
    orden: number,
    opciones: CriterioOpcion[],
    public readonly maxSelecciones: number | null
  ) {
    super(id, competicionId, titulo, descripcion, 'checklist', peso, orden, opciones);
  }

  validarRespuesta(respuesta: unknown): boolean {
    if (!Array.isArray(respuesta)) return respuesta === null || respuesta === undefined;
    if (this.maxSelecciones !== null && respuesta.length > this.maxSelecciones) return false;
    return respuesta.every((id) => this.opciones.some((opcion) => opcion.id === Number(id)));
  }
}
