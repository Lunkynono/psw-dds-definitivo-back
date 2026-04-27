import { Criterio, CriterioOpcion } from '../../entities/criterio.entity';

export class CriterioRadio extends Criterio {
  constructor(
    id: number | null,
    competicionId: number,
    titulo: string,
    descripcion: string | null,
    peso: number,
    orden: number,
    opciones: CriterioOpcion[]
  ) {
    super(id, competicionId, titulo, descripcion, 'radio', peso, orden, opciones);
  }

  validarRespuesta(respuesta: unknown): boolean {
    if (respuesta === null || respuesta === undefined || respuesta === '') return true;
    return this.opciones.some((opcion) => opcion.id === Number(respuesta));
  }
}
