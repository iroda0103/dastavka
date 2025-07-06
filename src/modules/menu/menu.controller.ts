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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { HasRole, IsLoggedIn } from '../auth/auth.guard';

@UseGuards(IsLoggedIn, new HasRole(['admin', 'restaurant']))
@Controller('menu')
export class MenuController {
  constructor(private readonly productsService: MenuService) {}

  @Post()
  create(@Body() createProductDto: CreateMenuDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('restaurant/:restaurantId')
  findAll(@Param('restaurantId', ParseIntPipe) restaurantId: number) {
    return this.productsService.findAll(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateMenuDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
