import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto, RegisterUserDto } from './dto/user.dto';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login({ phone, password }: LoginUserDto) {
    this.logger.log(`Login attempt with phone: ${phone}`);

    try {
      const [user] = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.phone, phone));

      if (!user) {
        this.logger.warn(`Login failed: User with phone ${phone} not found`);
        throw new NotFoundException({ message: 'User not found' });
      }

      this.logger.debug(`Verifying password for user ID: ${user.id}`);
      if (!(await this.comparePasswords(password, user.password))) {
        this.logger.warn(
          `Login failed: Incorrect password for user ${user.id}`,
        );
        throw new UnauthorizedException({
          message: 'Email or password incorrect',
        });
      }

      if (!process.env.JWT_SECRET) {
        this.logger.error('JWT_SECRET is missing in environment variables');
        throw new Error(
          'JWT_SECRET is missing. Please check your configuration.',
        );
      }

      this.logger.debug(`Generating JWT token for user ID: ${user.id}`);
      const token = this.jwtService.sign(
        {
          user: { id: user.id, role: user.role },
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '30d',
        },
      );

      this.logger.log(`User ${user.id} logged in successfully`);
      return { ...user, token: token };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw new BadRequestException(`Login failed: ${error.message}`);
    }
  }

  async register(createUser: RegisterUserDto) {
    this.logger.log(`Registering new user with phone: ${createUser.phone}`);

    try {
      this.logger.debug(`Checking if phone ${createUser.phone} already exists`);
      const user = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.phone, createUser.phone));

      if (user.length) {
        this.logger.warn(
          `Registration failed: Phone ${createUser.phone} already exists`,
        );
        throw new BadRequestException({ message: 'User already exists' });
      }

      let password = '';
      if (createUser.password) {
        this.logger.debug('Hashing password for new user');
        const salt = await bcrypt.genSalt();
        password = await bcrypt.hash(createUser.password, salt);

        this.logger.debug(`Creating new user with role: ${createUser.role}`);
        const result = await this.databaseService.db
          .insert(users)
          .values({
            phone: createUser.phone,
            role: createUser.role,
            password: password,
            name: createUser.name,
            address: createUser.address,
            telegramId: createUser.telegramId,
          } as RegisterUserDto)
          .returning();

        this.logger.log(
          `User registered successfully with ID: ${result[0].id}`,
        );
        return result;
      } else {
        this.logger.debug(
          `Creating user without password, role: ${createUser.role}`,
        );
        const result = await this.databaseService.db
          .insert(users)
          .values({
            phone: createUser.phone,
            role: createUser.role,
            name: createUser.name,
            address: createUser.address,
            telegramId: createUser.telegramId,
          } as RegisterUserDto)
          .returning();
        console.log(result);

        this.logger.log(
          `User registered successfully with ID: ${result[0].id}`,
        );
        return result;
      }
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Registration error: ${err.message}`, err.stack);
      return err.message;
    }
  }

  async getMe(user_id: number) {
    this.logger.log(`Getting profile for user ID: ${user_id}`);

    try {
      const user = await this.databaseService.db
        .select()
        .from(users)
        .where(eq(users.id, user_id));

      if (!user.length) {
        this.logger.warn(
          `Get profile failed: User with ID ${user_id} not found`,
        );
        throw new NotFoundException('User not found');
      }

      this.logger.debug(
        `Retrieved profile for user ID: ${user_id}, role: ${user[0].role}`,
      );
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Get profile error: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to get profile: ${error.message}`);
    }
  }

  async comparePasswords(
    enteredPass: string,
    storedPass: string,
  ): Promise<boolean> {
    this.logger.debug('Comparing password hashes');
    try {
      return await bcrypt.compare(enteredPass, storedPass);
    } catch (error) {
      this.logger.error(
        `Password comparison error: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Password comparison failed');
    }
  }
}
