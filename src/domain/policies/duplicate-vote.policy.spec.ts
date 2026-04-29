import { DuplicateVotePolicy } from './duplicate-vote.policy';

describe('DuplicateVotePolicy', () => {
  it('traduce el código 23505 a un mensaje funcional', () => {
    expect(() => DuplicateVotePolicy.traducirError({ code: '23505' })).toThrow(
      'Ya has votado en esta encuesta'
    );
  });

  it('reenvía el Error original si no es de unicidad', () => {
    const original = new Error('algo se rompió');
    expect(() => DuplicateVotePolicy.traducirError(original)).toThrow(original);
  });

  it('envuelve objetos arbitrarios con `message` en un Error nuevo', () => {
    expect(() => DuplicateVotePolicy.traducirError({ message: 'sin code' })).toThrow('sin code');
  });
});
