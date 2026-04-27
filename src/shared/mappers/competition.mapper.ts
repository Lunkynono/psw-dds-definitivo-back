import { Competicion } from '../../domain/entities/competicion.entity';

export class CompetitionMapper {
  static fromRow(row: any): Competicion {
    return new Competicion(row.id, row.evento_id, row.nombre, row.descripcion ?? null);
  }
}
