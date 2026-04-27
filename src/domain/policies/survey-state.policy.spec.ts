import { SurveyStatePolicy } from './survey-state.policy';

describe('SurveyStatePolicy.exigirAbierta', () => {
  it('no lanza si la encuesta está abierta', () => {
    expect(() => SurveyStatePolicy.exigirAbierta({ estado: 'abierta' })).not.toThrow();
  });

  it.each(['borrador', 'cerrada'])(
    'lanza si la encuesta está en estado %s',
    (estado) => {
      expect(() => SurveyStatePolicy.exigirAbierta({ estado })).toThrow('La encuesta no está abierta');
    }
  );
});

describe('SurveyStatePolicy.puedeCambiarEstado', () => {
  it('permite borrador → abierta y borrador → cerrada', () => {
    expect(SurveyStatePolicy.puedeCambiarEstado('borrador', 'abierta')).toBe(true);
    expect(SurveyStatePolicy.puedeCambiarEstado('borrador', 'cerrada')).toBe(true);
  });

  it('permite abierta → cerrada', () => {
    expect(SurveyStatePolicy.puedeCambiarEstado('abierta', 'cerrada')).toBe(true);
  });

  it('rechaza reabrir una encuesta cerrada', () => {
    expect(SurveyStatePolicy.puedeCambiarEstado('cerrada', 'abierta')).toBe(false);
    expect(SurveyStatePolicy.puedeCambiarEstado('cerrada', 'borrador')).toBe(false);
  });

  it('rechaza volver una encuesta abierta a borrador', () => {
    expect(SurveyStatePolicy.puedeCambiarEstado('abierta', 'borrador')).toBe(false);
  });

  it('rechaza estados desconocidos', () => {
    expect(SurveyStatePolicy.puedeCambiarEstado('archivada', 'abierta')).toBe(false);
    expect(SurveyStatePolicy.puedeCambiarEstado('borrador', 'archivada')).toBe(false);
  });
});
