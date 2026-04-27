import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

import { Type } from 'class-transformer';

export class CreateCompetitionInlineDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCompetitionInlineDto)
  competiciones: CreateCompetitionInlineDto[] = [];
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  imagenUrl?: string;
}

export class UploadImageDto {
  @IsString()
  @IsNotEmpty()
  base64: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsNotEmpty()
  extension: string;
}
