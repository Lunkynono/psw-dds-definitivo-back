import { Criterio, CriterioOpcion } from '../../entities/criterio.entity';

export class CriterioRubrica extends Criterio {
  constructor(
    id: number | null,
    competicionId: number,
    titulo: string,
    descripcion: string | null,
    peso: number,
    orden: number,
    opciones: CriterioOpcion[]
  ) {
    super(id, competicionId, titulo, descripcion, 'rubrica', peso, orden, opciones);
  }

  validarRespuesta(respuesta: unknown): boolean {
    return Array.isArray(respuesta) && respuesta.length > 0;
  }
}
