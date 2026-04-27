import { Injectable } from '@nestjs/common';
import { ResultCalculationService } from '../../modules/results/result-calculation.service';

/**
 * Facade del backend para resultados de encuesta.
 *
 * Existe principalmente como punto de extensión: si en el futuro la
 * obtención del ranking implica combinar varias fuentes (cache, eventos,
 * agregadores), este facade es el sitio natural para componerlas sin
 * impactar al controller.
 */
@Injectable()
export class ResultsFacade {
  constructor(private readonly results: ResultCalculationService) {}

  getSurveyResults(surveyId: number) {
    return this.results.list(surveyId);
  }

  recalculateSurveyResults(surveyId: number) {
    return this.results.recalculate(surveyId);
  }
}
