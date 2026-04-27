import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompetitionDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateCompetitionDto extends CreateCompetitionDto {}
