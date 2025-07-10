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
var MenuService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let MenuService = MenuService_1 = class MenuService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(MenuService_1.name);
    }
    async create(createProductDto) {
        this.logger.log(`Creating new product: ${createProductDto.name}`);
        try {
            const productValues = {
                name: createProductDto.name,
                image: createProductDto.image,
                price: createProductDto.price.toString(),
            };
            this.logger.debug(`Product details: name=${createProductDto.name}, price=${createProductDto.price}`);
            if (createProductDto.description) {
                productValues.description = createProductDto.description;
            }
            if (createProductDto.restaurantId) {
                productValues.restaurantId = createProductDto.restaurantId;
                this.logger.debug(`Creating product for restaurant ID: ${createProductDto.restaurantId}`);
            }
            const [product] = await this.databaseService.db
                .insert(schema_1.menu)
                .values(productValues)
                .returning();
            this.logger.log(`Product created successfully with ID: ${product.id}`);
            return product;
        }
        catch (error) {
            if (error.code === '23505') {
                this.logger.warn(`Product creation failed: A product with this name already exists`);
                throw new common_1.ConflictException('A product with this name already exists');
            }
            this.logger.error(`Failed to create product: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to create product: ${error.message}`);
        }
    }
    async findAll(restaurantId) {
        this.logger.log(`Finding all products for restaurant ID: ${restaurantId}`);
        try {
            let restaurantProducts = await this.databaseService.db
                .select({
                id: schema_1.menu.id,
                name: schema_1.menu.name,
                description: schema_1.menu.description,
                image: schema_1.menu.image,
                price: schema_1.menu.price,
                createdAt: schema_1.menu.createdAt,
                updatedAt: schema_1.menu.updatedAt,
            })
                .from(schema_1.menu)
                .where((0, drizzle_orm_1.eq)(schema_1.menu.restaurantId, restaurantId));
            this.logger.log(`Found ${restaurantProducts.length} products for restaurant ID: ${restaurantId}`);
            return restaurantProducts;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Error retrieving products for restaurant ${restaurantId}: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to get products for restaurant: ${error.message}`);
        }
    }
    findOne(id) {
        this.logger.log(`Finding product with ID: ${id}`);
        return `This action returns a #${id} product`;
    }
    update(id, updateProductDto) {
        this.logger.log(`Updating product with ID: ${id}`);
        this.logger.debug(`Update data: ${JSON.stringify(updateProductDto)}`);
        return `This action updates a #${id} product`;
    }
    remove(id) {
        this.logger.log(`Removing product with ID: ${id}`);
        return `This action removes a #${id} product`;
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = MenuService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], MenuService);
//# sourceMappingURL=menu.service.js.map