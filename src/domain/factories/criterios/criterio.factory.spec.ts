import { CriterioChecklist } from './criterio-checklist';
import { CriterioComentario } from './criterio-comentario';
import { CriterioFactory } from './criterio.factory';
import { CriterioNumerico } from './criterio-numerico';
import { CriterioRadio } from './criterio-radio';

describe('CriterioFactory', () => {
  it('crea un CriterioNumerico con su rango', () => {
    const c = CriterioFactory.crear({
      competicionId: 1,
      titulo: 'Innovación',
      tipo: 'numerico',
      rangoMin: 0,
      rangoMax: 10
    }) as CriterioNumerico;

    expect(c).toBeInstanceOf(CriterioNumerico);
    expect(c.rangoMin).toBe(0);
    expect(c.rangoMax).toBe(10);
  });

  it('crea un CriterioRadio con sus opciones', () => {
    const c = CriterioFactory.crear({
      competicionId: 1,
      titulo: 'Calidad',
      tipo: 'radio',
      opciones: [
        { texto: 'Buena', orden: 0 },
        { texto: 'Mala', orden: 1 }
      ]
    }) as CriterioRadio;

    expect(c).toBeInstanceOf(CriterioRadio);
    expect(c.opciones).toHaveLength(2);
  });

  it('crea un CriterioChecklist con maxSelecciones', () => {
    const c = CriterioFactory.crear({
      competicionId: 1,
      titulo: 'Tags',
      tipo: 'checklist',
      maxSelecciones: 3,
      opciones: [{ texto: 'a', orden: 0 }]
    }) as CriterioChecklist;

    expect(c).toBeInstanceOf(CriterioChecklist);
    expect(c.maxSelecciones).toBe(3);
  });

  it('crea un CriterioComentario por defecto cuando el tipo es comentario', () => {
    const c = CriterioFactory.crear({
      competicionId: 1,
      titulo: 'Feedback',
      tipo: 'comentario'
    }) as CriterioComentario;

    expect(c).toBeInstanceOf(CriterioComentario);
  });

  it('aplica peso=1 y orden=0 por defecto', () => {
    const c = CriterioFactory.crear({ competicionId: 1, titulo: 'X', tipo: 'numerico' });
    expect(c.peso).toBe(1);
    expect(c.orden).toBe(0);
  });
});
