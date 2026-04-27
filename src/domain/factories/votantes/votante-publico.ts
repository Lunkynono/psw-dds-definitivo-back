import { VotoPublico } from '../../entities/voto.entity';
import { VotanteBase } from './votante-base';

export class VotantePublico extends VotanteBase {
  crearVotos(encuestaId: number, correo: string, votos: Array<{ proyectoId: number; respuestas: VotoPublico['respuestas'] }>): VotoPublico[] {
    return votos.map((voto) => new VotoPublico(encuestaId, voto.proyectoId, correo, voto.respuestas));
  }
}
