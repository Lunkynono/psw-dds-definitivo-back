import { ArrayMinSize, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
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

export class ProjectDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
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
