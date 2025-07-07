import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { HasRole, IsLoggedIn } from '../auth/auth.guard';

// @UseGuards(IsLoggedIn)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @UseGuards(new HasRole(['admin', 'client']))
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    try {
      console.log('orders');
      return this.ordersService.create(createOrderDto);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @UseGuards(new HasRole(['admin']))
  @Get(':restaurantId')
  findAll(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.ordersService.findAll(restaurantId);
  }

  // new HasRole(['admin', 'client'])
  // @UseGuards()
  @Get('my-orders/:userId')
  getMyOrders(@Param('userId') userId: string) {
    return this.ordersService.getMyOrders(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
