import { RespuestaCriterio } from '../../entities/voto.entity';

export abstract class VotanteBase {
  protected normalizarRespuesta(criterioId: number, raw: Partial<RespuestaCriterio>): RespuestaCriterio {
    return {
      criterioId,
      valorNumerico: raw.valorNumerico ?? null,
      opcionesIds: raw.opcionesIds ?? null,
      valorTexto: raw.valorTexto?.trim() ? raw.valorTexto.trim() : null
    };
  }
}
