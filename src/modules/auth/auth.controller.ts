import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from './dto/user.dto';
import { IsLoggedIn } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{ token: string } | Error> {
    try {
      return await this.authService.login(loginUserDto);
    } catch (error) {
      throw new BadRequestException(error.message || 'Login failed');
    }
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      return await this.authService.register(registerUserDto);
    } catch (error) {
      throw new BadRequestException(error.message || 'Register failed');
    }
  }

  @Get('get-me')
  @UseGuards(IsLoggedIn)
  async getMe(@Req() req: Request) {
    try {
      return await this.authService.getMe(req['user'].id);
    } catch (error) {
      throw new BadRequestException(error.message || 'Get me not found');
    }
  }
}
