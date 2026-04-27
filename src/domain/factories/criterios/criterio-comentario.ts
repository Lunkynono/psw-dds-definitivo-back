import { Criterio } from '../../entities/criterio.entity';

export class CriterioComentario extends Criterio {
  validarRespuesta(respuesta: unknown): boolean {
    return respuesta === null || respuesta === undefined || typeof respuesta === 'string';
  }
}
