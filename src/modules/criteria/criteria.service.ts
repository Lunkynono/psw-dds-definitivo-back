import { Injectable } from '@nestjs/common';
import { CriterioFactory } from '../../domain/factories/criterios/criterio.factory';
import { CriterioRepository } from '../../infrastructure/repositories/criterio.repository';
import { CreateCriterionDto } from '../../shared/dto/criteria.dto';

@Injectable()
export class CriteriaService {
  constructor(private readonly criterios: CriterioRepository) {}

  list(competitionId: number) {
    return this.criterios.findByCompeticion(competitionId);
  }

  async create(competitionId: number, dto: CreateCriterionDto) {
    const tipo = dto.tipo as any;
    const criterio = CriterioFactory.crear({
      competicionId: competitionId,
      titulo: dto.titulo,
      descripcion: dto.descripcion ?? null,
      tipo,
      peso: dto.peso,
      rangoMin: dto.rangoMin ?? null,
      rangoMax: dto.rangoMax ?? null,
      maxSelecciones: dto.maxSelecciones ?? null,
      opciones: dto.opciones
    });

    return this.criterios.create({
      competicion_id: competitionId,
      titulo: criterio.titulo,
      descripcion: criterio.descripcion,
      tipo: dto.tipo,
      peso: criterio.peso,
      rango_min: dto.rangoMin ?? null,
      rango_max: dto.rangoMax ?? null,
      max_selecciones: dto.maxSelecciones ?? null,
      orden: criterio.orden
    }, dto.opciones.map((o) => ({
      texto: o.texto,
      orden: o.orden,
      peso: o.peso ?? 0,
      aspecto: o.aspecto ?? null,
      nivel: o.nivel ?? null,
      descriptor: o.descriptor ?? null
    })));
  }

  async update(criterionId: number, dto: CreateCriterionDto) {
    const tipo = dto.tipo as any;
    const criterio = CriterioFactory.crear({
      competicionId: 0,
      titulo: dto.titulo,
      descripcion: dto.descripcion ?? null,
      tipo,
      peso: dto.peso,
      rangoMin: dto.rangoMin ?? null,
      rangoMax: dto.rangoMax ?? null,
      maxSelecciones: dto.maxSelecciones ?? null,
      opciones: dto.opciones
    });

    return this.criterios.update(criterionId, {
      titulo: criterio.titulo,
      descripcion: criterio.descripcion,
      tipo: dto.tipo,
      peso: criterio.peso,
      rango_min: dto.rangoMin ?? null,
      rango_max: dto.rangoMax ?? null,
      max_selecciones: dto.maxSelecciones ?? null
    }, dto.opciones.map((o) => ({
      texto: o.texto,
      orden: o.orden,
      peso: o.peso ?? 0,
      aspecto: o.aspecto ?? null,
      nivel: o.nivel ?? null,
      descriptor: o.descriptor ?? null
    })));
  }

  delete(criterionId: number) {
    return this.criterios.delete(criterionId);
  }

  async ensureCommentCriterion(competitionId: number, criterioIds: number[]) {
    const criterios = await this.criterios.findByCompeticion(competitionId);
    const seleccionados = criterios.filter((criterio: any) => criterioIds.includes(criterio.id));
    const hasComment = seleccionados.some((criterio: any) => criterio.tipo === 'comentario');
    if (hasComment) return criterioIds;

    const comentario = await this.criterios.create({
      competicion_id: competitionId,
      titulo: 'Comentarios adicionales',
      descripcion: null,
      tipo: 'comentario',
      peso: 1,
      orden: criterios.length
    });

    return [...criterioIds, comentario.id];
  }
}
