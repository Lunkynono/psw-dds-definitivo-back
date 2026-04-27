import { IsArray, IsEmail, IsOptional } from 'class-validator';

export class AssignJudgeDto {
  @IsEmail()
  correo: string;

  @IsOptional()
  @IsArray()
  encuestaIds?: number[];
}
