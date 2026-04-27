import { Encuesta } from '../../domain/entities/encuesta.entity';

export class SurveyMapper {
  static fromRow(row: any): Encuesta {
    return new Encuesta(
      row.id,
      row.competicion_id,
      row.nombre,
      row.descripcion ?? null,
      row.tipo_votante,
      Number(row.peso ?? 1),
      row.creador_id,
      row.estado,
      row.codigo_sala ?? null
    );
  }

  static toRow(encuesta: Encuesta): Record<string, unknown> {
    return {
      competicion_id: encuesta.competicionId,
      nombre: encuesta.nombre,
      descripcion: encuesta.descripcion,
      tipo_votante: encuesta.tipoVotante,
      peso: encuesta.peso,
      creador_id: encuesta.creadorId,
      estado: encuesta.estado,
      codigo_sala: encuesta.codigoSala
    };
  }
}
