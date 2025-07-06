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
var RestaurantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_service_1 = require("../../database/database.service");
const schema_1 = require("../../database/schema");
const bcrypt = require("bcryptjs");
let RestaurantsService = RestaurantsService_1 = class RestaurantsService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(RestaurantsService_1.name);
    }
    async create(createRestaurantDto) {
        this.logger.log('Creating new restaurant');
        try {
            await this.validateUniquePhone(createRestaurantDto.phone);
            await this.validateCityExists(createRestaurantDto.cityId);
            const restaurantData = await this.buildCreateData(createRestaurantDto);
            const [newRestaurant] = await this.databaseService.db
                .insert(schema_1.restaurants)
                .values(restaurantData)
                .returning();
            this.logger.log(`Restaurant created with ID: ${newRestaurant.id}`);
            return this.findOne(newRestaurant.id);
        }
        catch (error) {
            this.logger.error(`Failed to create restaurant: ${error.message}`, error.stack);
            if (error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to create restaurant: ${error.message}`);
        }
    }
    async buildCreateData(dto) {
        const data = {
            name: dto.name,
            phone: dto.phone,
            image: dto.image,
            address: dto.address,
            category: dto.category,
            cityId: dto.cityId,
        };
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }
        return data;
    }
    async findAll(search, cityFilter) {
        try {
            const conditions = [];
            if (search) {
                conditions.push((0, drizzle_orm_1.ilike)(schema_1.restaurants.name, `%${search}%`));
            }
            if (cityFilter) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.restaurants.cityId, cityFilter));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            const [{ count }] = await this.databaseService.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.restaurants)
                .where(whereClause);
            const restaurantsList = await this.databaseService.db
                .select({
                id: schema_1.restaurants.id,
                name: schema_1.restaurants.name,
                phone: schema_1.restaurants.phone,
                image: schema_1.restaurants.image,
                address: schema_1.restaurants.address,
                category: schema_1.restaurants.category,
                cityId: schema_1.restaurants.cityId,
                createdAt: schema_1.restaurants.createdAt,
                updatedAt: schema_1.restaurants.updatedAt,
                city: {
                    id: schema_1.cities.id,
                    name: schema_1.cities.name,
                },
            })
                .from(schema_1.restaurants)
                .leftJoin(schema_1.cities, (0, drizzle_orm_1.eq)(schema_1.restaurants.cityId, schema_1.cities.id))
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.restaurants.createdAt));
            this.logger.log(`Found ${restaurantsList.length} restaurants`);
            return {
                data: restaurantsList,
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch restaurants: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to fetch restaurants: ${error.message}`);
        }
    }
    async findOne(id) {
        this.logger.log(`Fetching restaurant with ID: ${id}`);
        try {
            const [restaurant] = await this.databaseService.db
                .select({
                id: schema_1.restaurants.id,
                name: schema_1.restaurants.name,
                phone: schema_1.restaurants.phone,
                image: schema_1.restaurants.image,
                address: schema_1.restaurants.address,
                category: schema_1.restaurants.category,
                cityId: schema_1.restaurants.cityId,
                createdAt: schema_1.restaurants.createdAt,
                updatedAt: schema_1.restaurants.updatedAt,
                city: {
                    id: schema_1.cities.id,
                    name: schema_1.cities.name,
                },
            })
                .from(schema_1.restaurants)
                .leftJoin(schema_1.cities, (0, drizzle_orm_1.eq)(schema_1.restaurants.cityId, schema_1.cities.id))
                .where((0, drizzle_orm_1.eq)(schema_1.restaurants.id, id))
                .limit(1);
            if (!restaurant) {
                throw new common_1.NotFoundException(`Restaurant with ID ${id} not found`);
            }
            this.logger.log(`Restaurant found: ${restaurant.name}`);
            return restaurant;
        }
        catch (error) {
            this.logger.error(`Failed to fetch restaurant: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch restaurant: ${error.message}`);
        }
    }
    async update(id, updateRestaurantDto) {
        this.logger.log(`Updating restaurant with ID: ${id}`);
        try {
            await this.validateRestaurantExists(id);
            await this.validateUniquePhone(updateRestaurantDto.phone, id);
            await this.validateCityExists(updateRestaurantDto.cityId);
            const updateData = await this.buildUpdateData(updateRestaurantDto);
            const [updatedRestaurant] = await this.databaseService.db
                .update(schema_1.restaurants)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.restaurants.id, id))
                .returning();
            this.logger.log(`Restaurant updated: ${updatedRestaurant.name}`);
            return this.findOne(id);
        }
        catch (error) {
            this.logger.error(`Failed to update restaurant: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ConflictException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update restaurant: ${error.message}`);
        }
    }
    async validateRestaurantExists(id) {
        await this.findOne(id);
    }
    async validateUniquePhone(phone, excludeId) {
        if (!phone)
            return;
        const conditions = [(0, drizzle_orm_1.eq)(schema_1.restaurants.phone, phone)];
        if (excludeId) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.restaurants.id} != ${excludeId}`);
        }
        const existingPhone = await this.databaseService.db
            .select({ id: schema_1.restaurants.id })
            .from(schema_1.restaurants)
            .where((0, drizzle_orm_1.and)(...conditions))
            .limit(1);
        if (existingPhone.length > 0) {
            throw new common_1.ConflictException('Phone number already exists');
        }
    }
    async validateCityExists(cityId) {
        if (!cityId)
            return;
        const cityExists = await this.databaseService.db
            .select({ id: schema_1.cities.id })
            .from(schema_1.cities)
            .where((0, drizzle_orm_1.eq)(schema_1.cities.id, cityId))
            .limit(1);
        if (cityExists.length === 0) {
            throw new common_1.BadRequestException('City not found');
        }
    }
    async buildUpdateData(dto) {
        const updateData = {};
        const simpleFields = [
            'name',
            'phone',
            'image',
            'address',
            'cityId',
        ];
        simpleFields.forEach((field) => {
            if (dto[field] !== undefined) {
                updateData[field] = dto[field];
            }
        });
        if (dto.category)
            updateData.category = dto.category;
        if (dto.password)
            updateData.password = await bcrypt.hash(dto.password, 10);
        return updateData;
    }
    async remove(id) {
        this.logger.log(`Deleting restaurant with ID: ${id}`);
        try {
            await this.findOne(id);
            const [deletedRestaurant] = await this.databaseService.db
                .delete(schema_1.restaurants)
                .where((0, drizzle_orm_1.eq)(schema_1.restaurants.id, id))
                .returning();
            this.logger.log(`Restaurant deleted: ${deletedRestaurant.name}`);
            return { message: 'Restaurant deleted successfully', id };
        }
        catch (error) {
            this.logger.error(`Failed to delete restaurant: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to delete restaurant: ${error.message}`);
        }
    }
    async findByCity(cityId, page = 1, limit = 10) {
        this.logger.log(`Fetching restaurants for city ID: ${cityId}`);
        try {
            const offset = (page - 1) * limit;
            const [{ count }] = await this.databaseService.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.restaurants)
                .where((0, drizzle_orm_1.eq)(schema_1.restaurants.cityId, cityId));
            const restaurantsList = await this.databaseService.db
                .select({
                id: schema_1.restaurants.id,
                name: schema_1.restaurants.name,
                phone: schema_1.restaurants.phone,
                image: schema_1.restaurants.image,
                address: schema_1.restaurants.address,
                category: schema_1.restaurants.category,
                cityId: schema_1.restaurants.cityId,
                createdAt: schema_1.restaurants.createdAt,
                updatedAt: schema_1.restaurants.updatedAt,
                city: {
                    id: schema_1.cities.id,
                    name: schema_1.cities.name,
                },
            })
                .from(schema_1.restaurants)
                .leftJoin(schema_1.cities, (0, drizzle_orm_1.eq)(schema_1.restaurants.cityId, schema_1.cities.id))
                .where((0, drizzle_orm_1.eq)(schema_1.restaurants.cityId, cityId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.restaurants.createdAt))
                .limit(limit)
                .offset(offset);
            this.logger.log(`Found ${restaurantsList.length} restaurants in city ${cityId}`);
            return {
                data: restaurantsList,
                pagination: {
                    page,
                    limit,
                    total: Number(count),
                    totalPages: Math.ceil(Number(count) / limit),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch restaurants by city: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to fetch restaurants by city: ${error.message}`);
        }
    }
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = RestaurantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], RestaurantsService);
//# sourceMappingURL=restaurants.service.js.map