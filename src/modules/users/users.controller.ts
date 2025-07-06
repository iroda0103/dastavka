import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HasRole, IsLoggedIn } from '../auth/auth.guard';
import { log } from 'console';

@UseGuards()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  @UseGuards(IsLoggedIn)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(IsLoggedIn,new HasRole(['admin', 'client']))
  @Get('restaurants')
  getOnlyRestaurants() {
    return this.usersService.getOnlyRestaurants();
  }

  @UseGuards(IsLoggedIn,new HasRole(['admin', 'restaurant']))
  @Get()
  findAll(
    @Query('role') role: string,
    @Query('telegramId') telegramId: string,
  ) {
    return this.usersService.findAll(role, telegramId);
  }

  @Get('tg')
  findOne(@Query('telegramId') telegramId: string) {
    return this.usersService.findOne(telegramId);
  }
  @UseGuards(IsLoggedIn)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @UseGuards(IsLoggedIn)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  
  @UseGuards(IsLoggedIn)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
