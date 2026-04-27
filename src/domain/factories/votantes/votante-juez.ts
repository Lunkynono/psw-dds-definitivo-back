import { VotoJuez } from '../../entities/voto.entity';
import { VotanteBase } from './votante-base';

export class VotanteJuez extends VotanteBase {
  crearVoto(encuestaId: number, proyectoId: number, voterHash: string, respuestas: VotoJuez['respuestas']): VotoJuez {
    return new VotoJuez(encuestaId, proyectoId, voterHash, respuestas);
  }
}
