import { VotanteJuez } from './votante-juez';
import { VotanteJuezCreator } from './votante-juez.creator';
import { VotantePublico } from './votante-publico';
import { VotantePublicoCreator } from './votante-publico.creator';

/**
 * Factory de fachada para los dos tipos de votante del sistema.
 *
 * Internamente delega en los `VotanteCreator` específicos para mantener el
 * Factory Method puro: cada subclase decide qué instancia concreta crear.
 * Añadir un nuevo tipo de votante (por ejemplo, "votante remoto" con OAuth)
 * sería tan simple como crear `VotanteRemotoCreator`/`VotanteRemoto` y
 * exponer un nuevo método estático aquí.
 */
export class VotanteFactory {
  static crearJuez(): VotanteJuez {
    return new VotanteJuezCreator().crear();
  }

  static crearPublico(): VotantePublico {
    return new VotantePublicoCreator().crear();
  }
}
