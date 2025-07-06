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
var CitiesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitiesService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_service_1 = require("../../database/database.service");
const schema_1 = require("../../database/schema");
let CitiesService = CitiesService_1 = class CitiesService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(CitiesService_1.name);
    }
    async create(createCityDto) {
        const result = await this.databaseService.db
            .insert(schema_1.cities)
            .values({
            name: createCityDto.name,
        })
            .returning();
        return result[0];
    }
    async findAll() {
        try {
            const result = await this.databaseService.db.select().from(schema_1.cities);
            this.logger.log(`Found ${result.length} total cities`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to fetch cities: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to fetch cities: ${error.message}`);
        }
    }
    async findOne(id, includeRelations = false) {
        const queryOptions = {
            where: (0, drizzle_orm_1.eq)(schema_1.cities.id, id),
        };
        if (includeRelations) {
            queryOptions['with'] = {
                restaurants: true,
                users: true,
            };
        }
        const city = await this.databaseService.db.query.cities.findFirst(queryOptions);
        if (!city) {
            throw new common_1.NotFoundException(`City with ID ${id} not found`);
        }
        return city;
    }
    async remove(id) {
        await this.findOne(id);
        const relations = await this.checkCityRelations(id);
        if (relations.hasRelations) {
            throw new common_1.HttpException(`Cannot delete city with ID ${id} because it has related ${relations.relationTypes.join(', ')}.`, common_1.HttpStatus.CONFLICT);
        }
        const result = await this.databaseService.db
            .delete(schema_1.cities)
            .where((0, drizzle_orm_1.eq)(schema_1.cities.id, id))
            .returning();
        return result[0];
    }
    async checkCityRelations(cityId) {
        const relationTypes = [];
        const restaurantsList = await this.databaseService.db.query.restaurants.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.restaurants.cityId, cityId),
            columns: { id: true },
        });
        if (restaurantsList.length > 0) {
            relationTypes.push('restaurants');
        }
        const usersList = await this.databaseService.db.query.users.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.users.cityId, cityId),
            columns: { id: true },
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
};
exports.CitiesService = CitiesService;
exports.CitiesService = CitiesService = CitiesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CitiesService);
//# sourceMappingURL=cities.service.js.map