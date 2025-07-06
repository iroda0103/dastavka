import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsUrl,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  restaurantId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;
}

export class ProductsFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number(value) : undefined))
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value ? Number(value) : undefined))
  maxPrice?: number;
}

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'id';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
