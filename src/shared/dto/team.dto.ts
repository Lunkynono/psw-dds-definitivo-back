import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ParticipantDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  rol: string;
}

export class ProjectFileDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsNumber()
  tamano: number;

  @IsString()
  @IsNotEmpty()
  base64: string;
}

export class ProjectDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProjectFileDto)
  archivo?: ProjectFileDto;
}

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  equipoNombre: string;

  @ValidateNested()
  @Type(() => ProjectDto)
  proyecto: ProjectDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participantes: ParticipantDto[] = [];
}
