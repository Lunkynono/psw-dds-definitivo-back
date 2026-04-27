import { IsArray, IsEmail, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class VoteAnswerDto {
  @IsNumber()
  criterioId: number;

  @IsOptional()
  @IsNumber()
  valorNumerico?: number;

  @IsOptional()
  @IsArray()
  opcionesIds?: number[];

  @IsOptional()
  @IsString()
  valorTexto?: string;
}

export class SubmitJudgeVoteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoteAnswerDto)
  respuestas: VoteAnswerDto[];
}

export class IdentifyPublicVoterDto {
  @IsEmail()
  correo: string;
}

export class PublicProjectVoteDto {
  @IsNumber()
  proyectoId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoteAnswerDto)
  respuestas: VoteAnswerDto[];
}

export class SubmitPublicVoteDto {
  @IsEmail()
  correo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicProjectVoteDto)
  votos: PublicProjectVoteDto[];
}
