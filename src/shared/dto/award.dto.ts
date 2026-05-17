import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export const AWARD_TYPES = ['cash', 'trophy', 'recognition', 'sponsor', 'other'] as const;
export type AwardType = typeof AWARD_TYPES[number];

export class CreateAwardDto {
  @IsIn(AWARD_TYPES)
  tipo: AwardType;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @Min(1)
  posicion: number;

  @IsOptional()
  @IsString()
  condicionesEntrega?: string;
}

export class UpdateAwardDto {
  @IsOptional()
  @IsIn(AWARD_TYPES)
  tipo?: AwardType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  posicion?: number;

  @IsOptional()
  @IsString()
  condicionesEntrega?: string | null;
}
