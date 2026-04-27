import { VotanteCreator } from './votante.creator';
import { VotantePublico } from './votante-publico';

export class VotantePublicoCreator extends VotanteCreator<VotantePublico> {
  crear(): VotantePublico {
    return new VotantePublico();
  }
}
