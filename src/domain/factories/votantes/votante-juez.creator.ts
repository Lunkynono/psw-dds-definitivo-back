import { VotanteCreator } from './votante.creator';
import { VotanteJuez } from './votante-juez';

export class VotanteJuezCreator extends VotanteCreator<VotanteJuez> {
  crear(): VotanteJuez {
    return new VotanteJuez();
  }
}
