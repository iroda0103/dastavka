import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  telegramId?: string;

  @IsEnum(['admin', 'restaurant', 'client', 'driver', 'chef'])
  role: 'admin' | 'restaurant' | 'client' | 'driver' | 'chef';

  @IsString()
  @IsOptional()
  updatedAt?: string;
}
