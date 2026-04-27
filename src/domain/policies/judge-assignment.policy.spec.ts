import { JudgeAssignmentPolicy } from './judge-assignment.policy';

describe('JudgeAssignmentPolicy', () => {
  it('lanza si el organizador intenta asignarse como juez', () => {
    expect(() =>
      JudgeAssignmentPolicy.impedirOrganizadorComoJuez('user-1', 'user-1')
    ).toThrow('El organizador no puede ser juez de su propia competición');
  });

  it('no lanza si el juez es distinto del organizador', () => {
    expect(() =>
      JudgeAssignmentPolicy.impedirOrganizadorComoJuez('user-1', 'user-2')
    ).not.toThrow();
  });
});
