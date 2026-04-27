import { Proyecto } from '../../domain/entities/proyecto.entity';

export class ProjectMapper {
  static fromRow(row: any): Proyecto {
    return new Proyecto(row.id, row.equipo_id, row.nombre, row.descripcion ?? null);
  }
}
