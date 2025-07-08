import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  NEW = 'new',
  PROCESS = 'process',
  ON_WAY = 'on-way',
  DELIVERED = 'delivered',
  CANCEL = 'cancel',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  ONLINE = 'online',
}
export enum DeliveryMethod {
  DELIVERY = 'delivery',
  CARD = 'pickup'
}
export class CreateOrderDto {
  @IsString()
  address: string;

  @IsNumber()
  @IsInt()
  // @IsNotEmpty()
  driverId: number;

  @IsEnum(['card','online','cash'])
  @IsNotEmpty()
  paymentMethod: PaymentMethod

  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsEnum(['delivery','pickup'])
  @IsNotEmpty()
  deliveryMethod:DeliveryMethod

  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  restaurantId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty()
  items: CreateOrderItemDto[];

  @IsEnum(['new', 'process', 'on-way', 'delivered', 'cancel'], {
    message: 'Status must be one of: new, process, on-way, delivered, cancel',
  })
  @IsOptional()
  status: OrderStatus;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number) 
  deliveryFee: number;

  @IsString()
  @IsOptional()
  comment: string;
}

export class CreateOrderItemDto {
  @IsNumber()
  @IsInt()
  @IsNotEmpty()
  menuId: number; // This is a reference to menu.id in the database

  @IsNumber()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
