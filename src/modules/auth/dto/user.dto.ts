import { IsEnum, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}

export class RegisterUserDto {
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsOptional()
  @IsString()
  telegramId?: string;

  @IsEnum(['admin', 'restaurant', 'client', 'driver', 'chef'])
  role: 'admin' | 'restaurant' | 'client' | 'driver' | 'chef';
}
