export interface ComentarioAgrupado {
  proyectoId: number;
  origen: 'Publico' | 'Jurado';
  comentarios: string[];
}

export class CommentMapper {
  static agrupar(rows: Array<{ proyecto_id: number; origen: 'Publico' | 'Jurado'; valor_texto: string | null }>): ComentarioAgrupado[] {
    const map = new Map<string, ComentarioAgrupado>();

    for (const row of rows) {
      if (!row.valor_texto) continue;
      const key = `${row.proyecto_id}-${row.origen}`;
      const actual = map.get(key) ?? { proyectoId: row.proyecto_id, origen: row.origen, comentarios: [] };
      actual.comentarios.push(row.valor_texto);
      map.set(key, actual);
    }

    return [...map.values()];
  }
}
