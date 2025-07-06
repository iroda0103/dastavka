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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitiesController = void 0;
const common_1 = require("@nestjs/common");
const cities_service_1 = require("./cities.service");
const create_city_dto_1 = require("./dto/create-city.dto");
let CitiesController = class CitiesController {
    constructor(citiesService) {
        this.citiesService = citiesService;
    }
    async create(createCityDto) {
        try {
            return await this.citiesService.create(createCityDto);
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to create city', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async findAll() {
        try {
            return await this.citiesService.findAll();
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Failed to retrieve cities', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id, includeRelations) {
        try {
            const withRelations = includeRelations === 'true';
            return await this.citiesService.findOne(id, withRelations);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || `Failed to retrieve city with ID ${id}`, common_1.HttpStatus.NOT_FOUND);
        }
    }
    async remove(id) {
        try {
            await this.citiesService.remove(id);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException(error.message || `Failed to delete city with ID ${id}`, error.message.includes('has related')
                ? common_1.HttpStatus.CONFLICT
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.CitiesController = CitiesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_city_dto_1.CreateCityDto]),
    __metadata("design:returntype", Promise)
], CitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('include_relations')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], CitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CitiesController.prototype, "remove", null);
exports.CitiesController = CitiesController = __decorate([
    (0, common_1.Controller)('cities'),
    __metadata("design:paramtypes", [cities_service_1.CitiesService])
], CitiesController);
//# sourceMappingURL=cities.controller.js.map