import {
  ProyectoPuntuable,
  VoteCountScoreStrategy,
  WeightedNumericScoreStrategy
} from './result-score.strategy';

describe('WeightedNumericScoreStrategy', () => {
  const strategy = new WeightedNumericScoreStrategy();

  function proyecto(respuestas: ProyectoPuntuable['respuestasNumericas']): ProyectoPuntuable {
    return { proyectoId: 1, votosPublico: 0, votosJurado: 0, respuestasNumericas: respuestas, respuestasOpciones: [] };
  }

  it('devuelve 0 si la suma de pesos es 0 o negativa', () => {
    expect(strategy.calcular(proyecto([]), 0)).toBe(0);
    expect(strategy.calcular(proyecto([]), -1)).toBe(0);
  });

  it('media simple cuando hay un único criterio', () => {
    const score = strategy.calcular(
      proyecto([
        { criterioId: 10, peso: 1, valor: 8 },
        { criterioId: 10, peso: 1, valor: 6 }
      ]),
      1
    );
    expect(score).toBe(7);
  });

  it('aplica el peso de cada criterio al normalizar', () => {
    // Dos criterios: A peso 1, valor 10; B peso 3, valor 2.
    // sumaPesos = 4, suma = 1*10 + 3*2 = 16, score = 4
    const score = strategy.calcular(
      proyecto([
        { criterioId: 1, peso: 1, valor: 10 },
        { criterioId: 2, peso: 3, valor: 2 }
      ]),
      4
    );
    expect(score).toBe(4);
  });

  it('promedia respuestas múltiples del mismo criterio antes de ponderar', () => {
    // Criterio 1, peso 2, valores [4, 8] -> media 6, contribución 12
    // sumaPesos = 2, score = 6
    const score = strategy.calcular(
      proyecto([
        { criterioId: 1, peso: 2, valor: 4 },
        { criterioId: 1, peso: 2, valor: 8 }
      ]),
      2
    );
    expect(score).toBe(6);
  });
});

describe('VoteCountScoreStrategy', () => {
  it('suma votos público y jurado y los devuelve como puntaje', () => {
    const strategy = new VoteCountScoreStrategy();
    const score = strategy.calcular(
      { proyectoId: 1, votosPublico: 7, votosJurado: 5, respuestasNumericas: [], respuestasOpciones: [] },
      0
    );
    expect(score).toBe(12);
  });
});
