import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../../database/database.service';
import { users } from '../../database/schema';
import { eq, or, sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { CustomLoggerService } from '../../logger/logger.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly logger: CustomLoggerService,
  ) {
    // Set the context for all logs from this service
    logger.log('UsersService initialized', 'UsersService');
  }
  private buildLogMessage(role?: string, telegramId?: string): string {
    const filters = [];
    if (role) filters.push(`role: ${role}`);
    if (telegramId) filters.push(`telegramId: ${telegramId}`);

    return filters.length > 0
      ? `Fetching users with filters: ${filters.join(', ')}`
      : 'Fetching all users';
  }

  // Updated create method in users.service.ts
  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Creating new user with phone: ${createUserDto.phone}`);

    try {
      let password = '';

      const [phone] = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.phone, createUserDto.phone));

      if (phone) {
        this.logger.warn(
          `User creation failed: Phone ${createUserDto.phone} already exists`,
        );
        throw new BadRequestException({
          message: 'Bu raqam allaqachon mavjud',
        });
      }

      this.logger.debug('Hashing password...');
      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(createUserDto.password, salt);

      this.logger.debug(`Creating user with role: ${createUserDto.role}`);

      // Create the user data object with proper typing
      const userData = {
        phone: createUserDto.phone,
        password: password,
        name: createUserDto.name,
        address: createUserDto.address,
        role: createUserDto.role,
      };

      const result = await this.databaseService.db
        .insert(users)
        .values(userData as any)
        .returning();

      this.logger.log(`User created successfully with ID: ${result[0].id}`);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }
  }

  async getOnlyRestaurants() {
    this.logger.log('Fetching all restaurants');
    try {
      const restaurants = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.role, 'restaurant' as any));

      this.logger.log(`Found ${restaurants.length} restaurants`);
      return restaurants;
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

  async findAll(role?: string, telegramId?: string) {
    this.logger.log(this.buildLogMessage(role, telegramId));

    try {
      // Build where conditions with OR logic
      const conditions = [];

      if (role) {
        conditions.push(eq(users.role, role as any));
      }

      if (telegramId) {
        conditions.push(eq(users.telegramId, telegramId));
      }

      const whereClause = conditions.length > 0 ? or(...conditions) : undefined;

      const result = await this.databaseService.db
        .select()
        .from(users)
        .where(whereClause);

      this.logger.log(`Found ${result.length} users`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to fetch users: ${error.message}`);
    }
  }

  async findById(id: number) {
    this.logger.log(`Finding user with ID: ${id}`);

    try {
      const user = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.id, id));

      if (!user.length) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException({ message: 'User not found' });
      }

      this.logger.debug(`Found user: ${user[0].name}, role: ${user[0].role}`);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to find user with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to find user: ${error.message}`);
    }
  }

  // async findOne(telegramId: string) {
  //   this.logger.log(`Finding user with Telegram ID: ${telegramId}`);

  //   try {
  //     const user = await this.databaseService.db
  //       .select()
  //       .from(users)
  //       .where(eq(users.telegramId, telegramId)); 

  //     if (!user.length) {
  //       this.logger.warn(`User with Telegram ID ${telegramId} not found`);
  //       throw new NotFoundException({ message: 'User not found' });
  //     }

  //     this.logger.debug(`Found user: ${user[0].name}, role: ${user[0].role}`);
  //     return user;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     this.logger.error(
  //       `Failed to find user with Telegram ID ${telegramId}: ${error.message}`,
  //       error.stack,
  //     );
  //     throw new BadRequestException(`Failed to find user with Telegram ID: ${error.message}`);
  //   }
  // }
async findOne(telegramId: string) {
  this.logger.log(`Finding user with Telegram ID: ${telegramId}`);

  try {
    const user = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId));

    // if (!user.length) { 
    //   this.logger.warn(`User with Telegram ID ${telegramId} not found`);
    //   return {}; // yoki null — agar bo‘sh obyekt emas, null qaytarmoqchi bo‘lsangiz
    // }

    const foundUser = user[0] ? user[0] : {};
    // this.logger.debug(`Found user: ${foundUser.name}, role: ${foundUser.role}`);
    return foundUser;
  } catch (error) {
    this.logger.error(
      `Failed to find user with Telegram ID ${telegramId}: ${error.message}`,
      error.stack,
    );
    throw new BadRequestException(`Failed to find user with Telegram ID: ${error.message}`);
  }
}

  // In your users.service.ts update method
  async update(id: number, updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateUserDto)}`);

    try {
      const [user] = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.id, id));

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException({ message: 'User not found' });
      }

      // Type assertion to bypass the type error temporarily
      const result = await this.databaseService.db
        .update(users)
        .set({
          updatedAt: sql`NOW()`,
          ...updateUserDto,
        } as any) // Temporary fix
        .where(eq(users.id, id))
        .returning();

      this.logger.log(`User ${id} updated successfully`);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update user ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to update user: ${error.message}`);
    }
  }

  async remove(id: number) {
    this.logger.log(`Removing user with ID: ${id}`);

    try {
      const [user] = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.id, id));

      if (!user) {
        this.logger.warn(`User with ID ${id} not found`);
        throw new NotFoundException({ message: 'User not found' });
      }

      const result = await this.databaseService.db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      this.logger.log(`User ${id} deleted successfully`);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete user ${id}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(`Failed to delete user: ${error.message}`);
    }
  }
}
