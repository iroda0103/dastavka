import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { cities, restaurants, users } from 'src/database/schema';
import { CreateCityDto } from './dto/create-city.dto';
// import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCityDto: CreateCityDto) {
    const result = await this.databaseService.db
      .insert(cities)
      .values({
        name: createCityDto.name,
      })
      .returning();

    return result[0];
  }

  async findAll() {
    try {
      const result = await this.databaseService.db.select().from(cities);
      this.logger.log(`Found ${result.length} total cities`);

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch cities: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to fetch cities: ${error.message}`);
    }
  }

  async findOne(id: number, includeRelations = false) {
    const queryOptions = {
      where: eq(cities.id, id),
    };

    if (includeRelations) {
      queryOptions['with'] = {
        restaurants: true,
        users: true,
      };
    }

    const city =
      await this.databaseService.db.query.cities.findFirst(queryOptions);

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async remove(id: number) {
    // First verify the city exists
    await this.findOne(id);

    // Check if city has dependencies
    const relations = await this.checkCityRelations(id);
    if (relations.hasRelations) {
      throw new HttpException(
        `Cannot delete city with ID ${id} because it has related ${relations.relationTypes.join(', ')}.`,
        HttpStatus.CONFLICT,
      );
    }

    const result = await this.databaseService.db
      .delete(cities)
      .where(eq(cities.id, id))
      .returning();

    return result[0];
  }

  // Helper method to check if city has dependencies
  private async checkCityRelations(cityId: number) {
    const relationTypes = [];

    // Check for restaurants
    const restaurantsList =
      await this.databaseService.db.query.restaurants.findMany({
        where: eq(restaurants.cityId, cityId),
        columns: { id: true }, // Only select id to minimize data transfer
      });

    if (restaurantsList.length > 0) {
      relationTypes.push('restaurants');
    }

    // Check for users
    const usersList = await this.databaseService.db.query.users.findMany({
      where: eq(users.cityId, cityId),
      columns: { id: true }, // Only select id to minimize data transfer
    });

    if (usersList.length > 0) {
      relationTypes.push('users');
    }

    return {
      hasRelations: relationTypes.length > 0,
      relationTypes,
      counts: {
        restaurants: restaurantsList.length,
        users: usersList.length,
      },
    };
  }
}
