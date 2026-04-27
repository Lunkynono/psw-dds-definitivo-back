import { Criterio, CriterioTipo } from '../../entities/criterio.entity';
import { CriterioChecklist } from './criterio-checklist';
import { CriterioComentario } from './criterio-comentario';
import { CriterioNumerico } from './criterio-numerico';
import { CriterioRadio } from './criterio-radio';

/**
 * Factory Method para construir el `Criterio` correcto en función del tipo.
 *
 * Cada tipo (`numerico`, `radio`, `checklist`, `comentario`) tiene reglas y
 * atributos distintos (rango, opciones, máximo de selecciones...). Este
 * factory aísla a los servicios de las clases concretas y permite añadir
 * nuevos tipos creando una clase + un branch nuevo, sin tocar nada más.
 */
export interface CrearCriterioInput {
  id?: number | null;
  competicionId: number;
  titulo: string;
  descripcion?: string | null;
  tipo: CriterioTipo;
  peso?: number;
  orden?: number;
  rangoMin?: number | null;
  rangoMax?: number | null;
  maxSelecciones?: number | null;
  opciones?: Array<{ id?: number; texto: string; orden: number }>;
}

export class CriterioFactory {
  static crear(input: CrearCriterioInput): Criterio {
    const peso = input.peso ?? 1;
    const orden = input.orden ?? 0;
    const descripcion = input.descripcion ?? null;
    const opciones = input.opciones ?? [];

    if (input.tipo === 'numerico') {
      return new CriterioNumerico(input.id ?? null, input.competicionId, input.titulo, descripcion, peso, orden, input.rangoMin ?? null, input.rangoMax ?? null);
    }

    if (input.tipo === 'radio') {
      return new CriterioRadio(input.id ?? null, input.competicionId, input.titulo, descripcion, peso, orden, opciones);
    }

    if (input.tipo === 'checklist') {
      return new CriterioChecklist(input.id ?? null, input.competicionId, input.titulo, descripcion, peso, orden, opciones, input.maxSelecciones ?? null);
    }

    return new CriterioComentario(input.id ?? null, input.competicionId, input.titulo, descripcion, 'comentario', peso, orden);
  }
}
