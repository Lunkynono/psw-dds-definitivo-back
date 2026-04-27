export type TipoPuntuable = 'numerico' | 'radio' | 'checklist' | 'rubrica';

export interface OpcionPuntuable {
  id: number;
  peso: number;
}

export interface RespuestaOpciones {
  criterioId: number;
  tipo: TipoPuntuable;
  peso: number;
  opcionesIds: number[];
  opcionesDisponibles: OpcionPuntuable[];
}

export interface ProyectoPuntuable {
  proyectoId: number;
  votosPublico: number;
  votosJurado: number;
  respuestasNumericas: Array<{ criterioId: number; peso: number; valor: number }>;
  respuestasOpciones: RespuestaOpciones[];
}

export interface ResultScoreStrategy {
  calcular(proyecto: ProyectoPuntuable, sumaPesos: number): number;
}

function calcularValorOpciones(tipo: TipoPuntuable, opcionesIds: number[], disponibles: OpcionPuntuable[]): number | null {
  if (opcionesIds.length === 0) return null;
  const seleccionadas = disponibles.filter((op) => opcionesIds.includes(op.id));
  if (seleccionadas.length === 0) return null;
  const total = seleccionadas.reduce((sum, op) => sum + (Number(op.peso) || 0), 0);
  return tipo === 'checklist' || tipo === 'rubrica' ? total : total / seleccionadas.length;
}

/**
 * Media ponderada para todos los criterios puntuables: numérico, radio,
 * checklist y rubrica. Para rubrica y checklist el valor es la suma de
 * pesos de las opciones seleccionadas; para radio es el peso de la opción
 * dividido por el número de opciones seleccionadas (siempre 1).
 */
export class WeightedNumericScoreStrategy implements ResultScoreStrategy {
  calcular(proyecto: ProyectoPuntuable, sumaPesos: number): number {
    if (sumaPesos <= 0) return 0;

    const agrupadasNumericas = new Map<number, { peso: number; valores: number[] }>();
    for (const r of proyecto.respuestasNumericas) {
      const actual = agrupadasNumericas.get(r.criterioId) ?? { peso: r.peso, valores: [] };
      actual.valores.push(r.valor);
      agrupadasNumericas.set(r.criterioId, actual);
    }

    const agrupadasOpciones = new Map<number, { peso: number; tipo: TipoPuntuable; disponibles: OpcionPuntuable[]; valorPorVoto: number[] }>();
    for (const r of proyecto.respuestasOpciones) {
      const val = calcularValorOpciones(r.tipo, r.opcionesIds, r.opcionesDisponibles);
      if (val === null) continue;
      const actual = agrupadasOpciones.get(r.criterioId) ?? { peso: r.peso, tipo: r.tipo, disponibles: r.opcionesDisponibles, valorPorVoto: [] };
      actual.valorPorVoto.push(val);
      agrupadasOpciones.set(r.criterioId, actual);
    }

    let total = 0;
    for (const item of agrupadasNumericas.values()) {
      const media = item.valores.reduce((s, v) => s + v, 0) / item.valores.length;
      total += media * item.peso;
    }
    for (const item of agrupadasOpciones.values()) {
      const media = item.valorPorVoto.reduce((s, v) => s + v, 0) / item.valorPorVoto.length;
      total += media * item.peso;
    }

    return total / sumaPesos;
  }
}

/**
 * Fallback cuando no hay criterios puntuables: ranking por número de votos.
 */
export class VoteCountScoreStrategy implements ResultScoreStrategy {
  calcular(proyecto: ProyectoPuntuable, _sumaPesos: number): number {
    return proyecto.votosPublico + proyecto.votosJurado;
  }
}
