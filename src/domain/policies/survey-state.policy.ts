import { Encuesta } from '../entities/encuesta.entity';

/**
 * Reglas sobre el ciclo de vida del estado de una encuesta.
 *
 * Estados válidos: `borrador → abierta → cerrada` (también se permite el
 * atajo `borrador → cerrada` para descartar una encuesta sin abrirla).
 *
 * Vivir en una sola clase facilita reemplazar el control por un patrón
 * State o por una FSM más rica sin tocar los servicios.
 */
export class SurveyStatePolicy {
  /** Lanza si la encuesta no está en estado `abierta`. */
  static exigirAbierta(encuesta: Encuesta | { estado: string }): void {
    if (encuesta.estado !== 'abierta') {
      throw new Error('La encuesta no está abierta');
    }
  }

  /** Determina si una transición concreta entre estados es válida. */
  static puedeCambiarEstado(estadoActual: string, estadoNuevo: string): boolean {
    const transicionesPermitidas: Record<string, string[]> = {
      borrador: ['abierta', 'programada', 'cerrada'],
      programada: ['abierta', 'cerrada'],
      abierta: ['cerrada'],
      cerrada: ['abierta', 'programada']
    };

    return transicionesPermitidas[estadoActual]?.includes(estadoNuevo) ?? false;
  }
}
