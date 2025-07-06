import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  ParseIntPipe,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  async create(@Body() createCityDto: CreateCityDto) {
    try {
      return await this.citiesService.create(createCityDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create city',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.citiesService.findAll();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve cities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('include_relations') includeRelations?: string,
  ) {
    try {
      const withRelations = includeRelations === 'true';
      return await this.citiesService.findOne(id, withRelations);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || `Failed to retrieve city with ID ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // @Patch(':id')
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() updateCityDto: UpdateCityDto,
  // ) {
  //   try {
  //     return await this.citiesService.update(id, updateCityDto);
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       throw error;
  //     }
  //     throw new HttpException(
  //       error.message || `Failed to update city with ID ${id}`,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  // }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.citiesService.remove(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || `Failed to delete city with ID ${id}`,
        error.message.includes('has related')
          ? HttpStatus.CONFLICT
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
