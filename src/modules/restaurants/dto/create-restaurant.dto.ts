import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { restaurantCategoryEnum } from 'src/database/schema';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsIn(['fast_food', 'milliy_taom', 'pizza', 'burger'])
  @IsNotEmpty()
  category: 'fast_food' | 'milliy_taom' | 'pizza' | 'burger';

  @IsNumber()
  @IsNotEmpty()
  cityId: number;
}
