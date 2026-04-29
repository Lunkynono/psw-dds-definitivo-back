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
    this.validate(dto);
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
    this.validate(dto);
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
    void competitionId;
    return criterioIds;
  }

  private validate(dto: CreateCriterionDto) {
    if (!dto.titulo?.trim()) throw new Error('El título es obligatorio');
    if (!Number.isFinite(Number(dto.peso)) || Number(dto.peso) <= 0) {
      throw new Error('El peso debe ser mayor que cero');
    }
    if ((dto.rangoMin != null && Number(dto.rangoMin) < 0) || (dto.rangoMax != null && Number(dto.rangoMax) < 0)) {
      throw new Error('Los rangos no pueden ser negativos');
    }
    if (dto.rangoMin != null && dto.rangoMax != null && Number(dto.rangoMin) > Number(dto.rangoMax)) {
      throw new Error('El rango mínimo no puede ser mayor que el máximo');
    }
    if (dto.maxSelecciones != null && Number(dto.maxSelecciones) < 1) {
      throw new Error('El máximo de selecciones debe ser mayor que cero');
    }
    if (dto.opciones?.some((opcion) => Number(opcion.peso ?? 0) < 0 || Number(opcion.orden ?? 0) < 0)) {
      throw new Error('Los pesos y órdenes no pueden ser negativos');
    }
    if (['radio', 'checklist'].includes(dto.tipo)) {
      const opciones = (dto.opciones ?? []).filter((opcion) => opcion.texto?.trim());
      if (opciones.length < 2) {
        throw new Error('Añade al menos dos opciones');
      }
      const suma = opciones.reduce((total, opcion) => total + Number(opcion.peso ?? 0), 0);
      if (Math.abs(suma - Number(dto.peso)) >= 0.0001) {
        throw new Error(`Peso asignado ${suma.toFixed(2)} de ${Number(dto.peso)}. Ajusta los pesos antes de guardar`);
      }
    }
    if (dto.tipo === 'rubrica') {
      const opciones = (dto.opciones ?? []).filter((opcion) => opcion.texto?.trim() && opcion.aspecto?.trim());
      const pesosPorAspecto = new Map<string, number>();
      for (const opcion of opciones) {
        const aspecto = opcion.aspecto!.trim();
        pesosPorAspecto.set(aspecto, Math.max(pesosPorAspecto.get(aspecto) ?? 0, Number(opcion.peso ?? 0)));
      }
      if (pesosPorAspecto.size === 0) {
        throw new Error('Añade al menos un aspecto a evaluar');
      }
      const suma = [...pesosPorAspecto.values()].reduce((total, peso) => total + peso, 0);
      if (Math.abs(suma - Number(dto.peso)) >= 0.0001) {
        throw new Error(`Peso asignado ${suma.toFixed(2)} de ${Number(dto.peso)}. Ajusta los pesos antes de guardar`);
      }
    }
  }
}
