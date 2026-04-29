import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsIn(['juez', 'publico', 'ambos'])
  tipoVotante: 'juez' | 'publico' | 'ambos';

  @IsNumber()
  peso: number = 1;

  @IsOptional()
  @IsIn(['borrador', 'abierta', 'programada', 'cerrada'])
  estado?: 'borrador' | 'abierta' | 'programada' | 'cerrada';

  @IsArray()
  @ArrayMinSize(1)
  criterioIds: number[] = [];

  @IsOptional()
  @IsString()
  horaApertura?: string;

  @IsOptional()
  @IsString()
  horaCierre?: string;

  @IsOptional()
  @IsArray()
  equipoIds?: number[];

  @IsOptional()
  @IsArray()
  juecesIds?: string[];
}

export class UpdateSurveyStateDto {
  @IsIn(['borrador', 'abierta', 'programada', 'cerrada'])
  estado: 'borrador' | 'abierta' | 'programada' | 'cerrada';
}

export class UpdateSurveyScheduleDto {
  @IsOptional()
  @IsString()
  horaApertura?: string | null;

  @IsOptional()
  @IsString()
  horaCierre?: string | null;
}

export class UpdateSurveyAssignmentsDto {
  @IsArray()
  equipoIds: number[] = [];

  @IsArray()
  juecesIds: string[] = [];
}
