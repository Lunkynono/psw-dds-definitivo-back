import { Injectable } from '@nestjs/common';
import { ProyectoPuntuable, VoteCountScoreStrategy, WeightedNumericScoreStrategy } from '../strategies/result-score.strategy';

/**
 * Calculator que selecciona la Strategy adecuada según los datos de la
 * encuesta. Mantenemos las dos Strategy como atributos para que añadir
 * una nueva sea trivial: bastaría con instanciarla aquí y elegirla en
 * `calcular()` según las condiciones que aplique.
 */
@Injectable()
export class ResultScoreCalculator {
  private readonly weightedStrategy = new WeightedNumericScoreStrategy();
  private readonly countStrategy = new VoteCountScoreStrategy();

  /**
   * Devuelve el puntaje del proyecto.
   *
   * - Si la encuesta tiene al menos un criterio numérico (`sumaPesos > 0`),
   *   usa la media ponderada por criterio.
   * - En caso contrario, usa el número total de votos como puntaje.
   */
  calcular(proyecto: ProyectoPuntuable, sumaPesosNumericos: number): number {
    if (sumaPesosNumericos > 0) {
      return this.weightedStrategy.calcular(proyecto, sumaPesosNumericos);
    }

    return this.countStrategy.calcular(proyecto, sumaPesosNumericos);
  }
}
