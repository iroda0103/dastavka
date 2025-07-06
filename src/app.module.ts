import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { JwtService } from '@nestjs/jwt';
import { MenuModule } from './modules/menu/menu.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { CitiesModule } from './modules/cities/cities.module';
import { UploadModule } from './upload/upload.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    UsersModule,
    OrdersModule,
    MenuModule,
    RestaurantsModule,
    CitiesModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
