import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [MenuController],
  providers: [MenuService, JwtService],
})
export class MenuModule {}
