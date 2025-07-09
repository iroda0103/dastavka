// src/restaurants/restaurants.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { eq, desc, ilike, and, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service'; // Adjust import path
import { restaurants, cities } from '../../database/schema'; // Adjust import path
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(private readonly databaseService: DatabaseService) { }

  async create(createRestaurantDto: CreateRestaurantDto) {
    this.logger.log('Creating new restaurant');

    try {
      await this.validateUniquePhone(createRestaurantDto.phone);
      await this.validateCityExists(createRestaurantDto.cityId);

      const restaurantData = await this.buildCreateData(createRestaurantDto);

      const [newRestaurant] = await this.databaseService.db
        .insert(restaurants)
        .values(restaurantData)
        .returning();

      this.logger.log(`Restaurant created with ID: ${newRestaurant.id}`);
      return this.findOne(newRestaurant.id);
    } catch (error) {
      this.logger.error(
        `Failed to create restaurant: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create restaurant: ${error.message}`,
      );
    }
  }

  private async buildCreateData(dto: CreateRestaurantDto): Promise<any> {
    // Use type assertion to allow adding password later
    const data: any = {
      name: dto.name,
      phone: dto.phone,
      image: dto.image,
      address: dto.address,
      category: dto.category as any,
      cityId: dto.cityId,
    };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return data;
  }

  async findAll(search?: string, cityFilter?: number): Promise<any> {
    try {
      // Build where conditions
      const conditions = [];
      if (search) {
        conditions.push(ilike(restaurants.name, `%${search}%`));
      }
      if (cityFilter) {
        conditions.push(eq(restaurants.cityId, cityFilter as number));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [{ count }] = await this.databaseService.db
        .select({ count: sql<number>`count(*)` })
        .from(restaurants)
        .where(whereClause);

      // Get restaurants with city information
      const restaurantsList = await this.databaseService.db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          phone: restaurants.phone,
          image: restaurants.image,
          address: restaurants.address,
          category: restaurants.category,
          cityId: restaurants.cityId,
          createdAt: restaurants.createdAt,
          updatedAt: restaurants.updatedAt,
          city: {
            id: cities.id,
            name: cities.name,
          },
        })
        .from(restaurants)
        .leftJoin(cities, eq(restaurants.cityId, cities.id))
        .where(whereClause)
        .orderBy(desc(restaurants.createdAt));

      this.logger.log(`Found ${restaurantsList.length} restaurants`);

      return {
        data: restaurantsList,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch restaurants: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to fetch restaurants: ${error.message}`,
      );
    }
  }
  async findAllWithCategory(search?: string, cityFilter?: number): Promise<any> {
    try {
      // Build where conditions
      const conditions = [];
      if (search) {
        conditions.push(ilike(restaurants.name, `%${search}%`));
      }
      if (cityFilter) {
        conditions.push(eq(restaurants.cityId, cityFilter as number));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const [{ count }] = await this.databaseService.db
        .select({ count: sql<number>`count(*)` })
        .from(restaurants)
        .where(whereClause);

      // Get restaurants with city information
      const restaurantsList = await this.databaseService.db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          phone: restaurants.phone,
          image: restaurants.image,
          address: restaurants.address,
          category: restaurants.category,
          cityId: restaurants.cityId,
          createdAt: restaurants.createdAt,
          updatedAt: restaurants.updatedAt,
          city: {
            id: cities.id,
            name: cities.name,
          },
        })
        .from(restaurants)
        .leftJoin(cities, eq(restaurants.cityId, cities.id))
        .where(whereClause)
        .orderBy(desc(restaurants.createdAt));

      this.logger.log(`Found ${restaurantsList.length} restaurants`);

      const convertedResList = this.transformRestaurantList(restaurantsList);

      return {
        data: convertedResList,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch restaurants: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to fetch restaurants: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    this.logger.log(`Fetching restaurant with ID: ${id}`);

    try {
      const [restaurant] = await this.databaseService.db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          phone: restaurants.phone,
          image: restaurants.image,
          address: restaurants.address,
          category: restaurants.category,
          cityId: restaurants.cityId,
          createdAt: restaurants.createdAt,
          updatedAt: restaurants.updatedAt,
          city: {
            id: cities.id,
            name: cities.name,
          },
        })
        .from(restaurants)
        .leftJoin(cities, eq(restaurants.cityId, cities.id))
        .where(eq(restaurants.id, id))
        .limit(1);

      if (!restaurant) {
        throw new NotFoundException(`Restaurant with ID ${id} not found`);
      }

      this.logger.log(`Restaurant found: ${restaurant.name}`);
      return restaurant;
    } catch (error) {
      this.logger.error(
        `Failed to fetch restaurant: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch restaurant: ${error.message}`,
      );
    }
  }

  async update(id: number, updateRestaurantDto: UpdateRestaurantDto) {
    this.logger.log(`Updating restaurant with ID: ${id}`);

    try {
      await this.validateRestaurantExists(id);
      await this.validateUniquePhone(updateRestaurantDto.phone, id);
      await this.validateCityExists(updateRestaurantDto.cityId);

      const updateData = await this.buildUpdateData(updateRestaurantDto);

      const [updatedRestaurant] = await this.databaseService.db
        .update(restaurants)
        .set(updateData)
        .where(eq(restaurants.id, id))
        .returning();

      this.logger.log(`Restaurant updated: ${updatedRestaurant.name}`);
      return this.findOne(id);
    } catch (error) {
      this.logger.error(
        `Failed to update restaurant: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update restaurant: ${error.message}`,
      );
    }
  }

  private async validateRestaurantExists(id: number): Promise<void> {
    await this.findOne(id);
  }

  private async validateUniquePhone(
    phone?: string,
    excludeId?: number,
  ): Promise<void> {
    if (!phone) return;

    const conditions = [eq(restaurants.phone, phone)];
    if (excludeId) {
      conditions.push(sql`${restaurants.id} != ${excludeId}`);
    }

    const existingPhone = await this.databaseService.db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(and(...conditions))
      .limit(1);

    if (existingPhone.length > 0) {
      throw new ConflictException('Phone number already exists');
    }
  }

  private async validateCityExists(cityId?: number): Promise<void> {
    if (!cityId) return;

    const cityExists = await this.databaseService.db
      .select({ id: cities.id })
      .from(cities)
      .where(eq(cities.id, cityId))
      .limit(1);

    if (cityExists.length === 0) {
      throw new BadRequestException('City not found');
    }
  }

  private async buildUpdateData(
    dto: UpdateRestaurantDto,
  ): Promise<Record<string, any>> {
    const updateData: Record<string, any> = {};

    // Map simple fields
    const simpleFields = [
      'name',
      'phone',
      'image',
      'address',
      'cityId',
    ] as const;
    simpleFields.forEach((field) => {
      if (dto[field] !== undefined) {
        updateData[field] = dto[field];
      }
    });

    // Handle special fields
    if (dto.category) updateData.category = dto.category as any;
    if (dto.password) updateData.password = await bcrypt.hash(dto.password, 10);

    return updateData;
  }

  async remove(id: number) {
    this.logger.log(`Deleting restaurant with ID: ${id}`);

    try {
      // Check if restaurant exists
      await this.findOne(id);

      const [deletedRestaurant] = await this.databaseService.db
        .delete(restaurants)
        .where(eq(restaurants.id, id))
        .returning();

      this.logger.log(`Restaurant deleted: ${deletedRestaurant.name}`);
      return { message: 'Restaurant deleted successfully', id };
    } catch (error) {
      this.logger.error(
        `Failed to delete restaurant: ${error.message}`,
        error.stack,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete restaurant: ${error.message}`,
      );
    }
  }

  async findByCity(cityId: number, page: number = 1, limit: number = 10) {
    this.logger.log(`Fetching restaurants for city ID: ${cityId}`);

    try {
      const offset = (page - 1) * limit;

      // Get total count for the city
      const [{ count }] = await this.databaseService.db
        .select({ count: sql<number>`count(*)` })
        .from(restaurants)
        .where(eq(restaurants.cityId, cityId));

      // Get restaurants for the city
      const restaurantsList = await this.databaseService.db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          phone: restaurants.phone,
          image: restaurants.image,
          address: restaurants.address,
          category: restaurants.category,
          cityId: restaurants.cityId,
          createdAt: restaurants.createdAt,
          updatedAt: restaurants.updatedAt,
          city: {
            id: cities.id,
            name: cities.name,
          },
        })
        .from(restaurants)
        .leftJoin(cities, eq(restaurants.cityId, cities.id))
        .where(eq(restaurants.cityId, cityId))
        .orderBy(desc(restaurants.createdAt))
        .limit(limit)
        .offset(offset);

      this.logger.log(
        `Found ${restaurantsList.length} restaurants in city ${cityId}`,
      );

      return {
        data: restaurantsList,
        pagination: {
          page,
          limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch restaurants by city: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to fetch restaurants by city: ${error.message}`,
      );
    }
  }


  private transformRestaurantList(data) {
    const categoryMap = new Map();
    let categoryId = 1;

    console.log('data', data);

    data.forEach((restaurant) => {
      const categoryName =
        restaurant.category.charAt(0).toUpperCase() +
        restaurant.category.slice(1);

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          id: categoryId++,
          category: categoryName,
          restaurants: [],
        });
      }

      const restaurantData = {
        id: restaurant.id,
        name: restaurant.name,
        phone: restaurant.phone,
        image: restaurant.image,
        address: restaurant.address,
        cityId: restaurant.cityId,
        createdAt: restaurant.createdAt,
        updatedAt: restaurant.updatedAt,
        city: restaurant.city,
      };

      categoryMap.get(categoryName).restaurants.push(restaurantData);
    });

    return Array.from(categoryMap.values());
  }

}


