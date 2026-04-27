import { ResultScoreCalculator } from './result-score.calculator';

describe('ResultScoreCalculator', () => {
  const calculator = new ResultScoreCalculator();

  it('aplica la Strategy ponderada cuando hay criterios numéricos', () => {
    const score = calculator.calcular(
      {
        proyectoId: 1,
        votosPublico: 999,
        votosJurado: 999,
        respuestasNumericas: [{ criterioId: 1, peso: 1, valor: 5 }],
        respuestasOpciones: []
      },
      1
    );
    // Con sumaPesos > 0 ignora el conteo de votos.
    expect(score).toBe(5);
  });

  it('cae al conteo de votos cuando no hay criterios numéricos', () => {
    const score = calculator.calcular(
      {
        proyectoId: 1,
        votosPublico: 3,
        votosJurado: 4,
        respuestasNumericas: [],
        respuestasOpciones: []
      },
      0
    );
    expect(score).toBe(7);
  });
});
