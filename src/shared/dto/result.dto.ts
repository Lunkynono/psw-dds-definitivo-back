import { IsNumber, IsOptional } from 'class-validator';

export class UpdateManualScoreDto {
  @IsOptional()
  @IsNumber()
  puntajeManual: number | null;
}
