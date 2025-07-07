"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt = require("bcryptjs");
const logger_service_1 = require("../../logger/logger.service");
let UsersService = class UsersService {
    constructor(databaseService, logger) {
        this.databaseService = databaseService;
        this.logger = logger;
        logger.log('UsersService initialized', 'UsersService');
    }
    buildLogMessage(role, telegramId) {
        const filters = [];
        if (role)
            filters.push(`role: ${role}`);
        if (telegramId)
            filters.push(`telegramId: ${telegramId}`);
        return filters.length > 0
            ? `Fetching users with filters: ${filters.join(', ')}`
            : 'Fetching all users';
    }
    async create(createUserDto) {
        this.logger.log(`Creating new user with phone: ${createUserDto.phone}`);
        try {
            let password = '';
            const [phone] = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.phone, createUserDto.phone));
            if (phone) {
                this.logger.warn(`User creation failed: Phone ${createUserDto.phone} already exists`);
                throw new common_1.BadRequestException({
                    message: 'Bu raqam allaqachon mavjud',
                });
            }
            this.logger.debug('Hashing password...');
            const salt = await bcrypt.genSalt();
            password = await bcrypt.hash(createUserDto.password, salt);
            this.logger.debug(`Creating user with role: ${createUserDto.role}`);
            const userData = {
                phone: createUserDto.phone,
                password: password,
                name: createUserDto.name,
                address: createUserDto.address,
                role: createUserDto.role,
            };
            const result = await this.databaseService.db
                .insert(schema_1.users)
                .values(userData)
                .returning();
            this.logger.log(`User created successfully with ID: ${result[0].id}`);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            this.logger.error(`Failed to create user: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to create user: ${error.message}`);
        }
    }
    async getOnlyRestaurants() {
        this.logger.log('Fetching all restaurants');
        try {
            const restaurants = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.role, 'restaurant'));
            this.logger.log(`Found ${restaurants.length} restaurants`);
            return restaurants;
        }
        catch (error) {
            this.logger.error(`Failed to fetch restaurants: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to fetch restaurants: ${error.message}`);
        }
    }
    async findAll(role, telegramId) {
        this.logger.log(this.buildLogMessage(role, telegramId));
        try {
            const conditions = [];
            if (role) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.users.role, role));
            }
            if (telegramId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.users.telegramId, telegramId));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.or)(...conditions) : undefined;
            const result = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where(whereClause);
            this.logger.log(`Found ${result.length} users`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to fetch users: ${error.message}`);
        }
    }
    async findById(id) {
        this.logger.log(`Finding user with ID: ${id}`);
        try {
            const user = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
            if (!user.length) {
                this.logger.warn(`User with ID ${id} not found`);
                throw new common_1.NotFoundException({ message: 'User not found' });
            }
            this.logger.debug(`Found user: ${user[0].name}, role: ${user[0].role}`);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to find user with ID ${id}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to find user: ${error.message}`);
        }
    }
    async findOne(telegramId) {
        this.logger.log(`Finding user with Telegram ID: ${telegramId}`);
        try {
            const user = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.telegramId, telegramId));
            const foundUser = user[0] ? user[0] : {};
            return foundUser;
        }
        catch (error) {
            this.logger.error(`Failed to find user with Telegram ID ${telegramId}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to find user with Telegram ID: ${error.message}`);
        }
    }
    async update(id, updateUserDto) {
        this.logger.log(`Updating user with ID: ${id}`);
        this.logger.debug(`Update data: ${JSON.stringify(updateUserDto)}`);
        try {
            const [user] = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
            if (!user) {
                this.logger.warn(`User with ID ${id} not found`);
                throw new common_1.NotFoundException({ message: 'User not found' });
            }
            const result = await this.databaseService.db
                .update(schema_1.users)
                .set({
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
                ...updateUserDto,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                .returning();
            this.logger.log(`User ${id} updated successfully`);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to update user ${id}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to update user: ${error.message}`);
        }
    }
    async remove(id) {
        this.logger.log(`Removing user with ID: ${id}`);
        try {
            const [user] = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
            if (!user) {
                this.logger.warn(`User with ID ${id} not found`);
                throw new common_1.NotFoundException({ message: 'User not found' });
            }
            const result = await this.databaseService.db
                .delete(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                .returning();
            this.logger.log(`User ${id} deleted successfully`);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Failed to delete user ${id}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to delete user: ${error.message}`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        logger_service_1.CustomLoggerService])
], UsersService);
//# sourceMappingURL=users.service.js.map