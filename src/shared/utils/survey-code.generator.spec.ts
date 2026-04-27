import { SurveyCodeGenerator } from './survey-code.generator';

describe('SurveyCodeGenerator', () => {
  const generator = new SurveyCodeGenerator();

  it('genera un código del tamaño solicitado', () => {
    expect(generator.generar(6)).toHaveLength(6);
    expect(generator.generar(10)).toHaveLength(10);
  });

  it('usa exclusivamente el alfabeto sin caracteres ambiguos', () => {
    const codigo = generator.generar(64);
    expect(codigo).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
  });

  it('por defecto produce 6 caracteres', () => {
    expect(generator.generar()).toHaveLength(6);
  });
});
