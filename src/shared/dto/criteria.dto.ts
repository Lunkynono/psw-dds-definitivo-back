import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CriterionOptionDto {
  @IsString()
  @IsNotEmpty()
  texto: string;

  @IsNumber()
  orden: number;

  @IsOptional()
  @IsNumber()
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
  peso: number = 1;

  @IsOptional()
  @IsNumber()
  rangoMin?: number;

  @IsOptional()
  @IsNumber()
  rangoMax?: number;

  @IsOptional()
  @IsNumber()
  maxSelecciones?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionOptionDto)
  opciones: CriterionOptionDto[] = [];
}
