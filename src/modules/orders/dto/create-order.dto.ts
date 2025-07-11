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

// export enum OrderStatus {
//   NEW = 'new',
//   PROCESS = 'process',
//   ON_WAY = 'on-way',
//   DELIVERED = 'delivered',
//   CANCEL = 'cancel',
// }
export enum OrderStatus {
  NEW = 'new',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
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
  @IsOptional()
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

  @IsEnum(['new', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'], {
    message: 'Status must be one of: new, confirmed, preparing,ready_for_pickup,out_for_delivery,delivered,cancelled',
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
