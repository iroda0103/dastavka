import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService, JwtService, UsersService],
  exports: [OrdersService],
})
export class OrdersModule {}
