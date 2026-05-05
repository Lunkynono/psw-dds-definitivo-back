import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  correo: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  tipo?: string;
}

export class LoginDto {
  @IsEmail()
  correo: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AuthTokenDto {
  @IsOptional()
  @IsString()
  accessToken?: string;
}
