import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CriterionOptionDto {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsNumber()
  @Min(0)
  orden: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  peso?: number;

  @IsOptional()
  @IsString()
  aspecto?: string;

  @IsOptional()
  @IsString()
  nivel?: string;

  @IsOptional()
  @IsString()
  descriptor?: string;
}

export class CreateCriterionDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsIn(['numerico', 'radio', 'checklist', 'comentario', 'rubrica'])
  tipo: 'numerico' | 'radio' | 'checklist' | 'comentario' | 'rubrica';

  @IsNumber()
  @Min(0.1)
  peso: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rangoMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rangoMax?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelecciones?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionOptionDto)
  opciones: CriterionOptionDto[] = [];
}
