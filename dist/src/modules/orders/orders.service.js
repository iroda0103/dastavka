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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(databaseService) {
        this.databaseService = databaseService;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async create(createOrderDto) {
        this.logger.log(`Creating new order for restaurant ID: ${createOrderDto.restaurantId}`);
        try {
            const { address, driverId, clientId, restaurantId, items, discount = 0, deliveryFee = 0, } = createOrderDto;
            this.logger.debug(`Order params: client=${clientId}, driver=${driverId}, items=${items.length}`);
            this.logger.debug('Validating participants...');
            await this.validateParticipants(driverId, clientId, restaurantId);
            this.logger.debug('All participants validated successfully');
            this.logger.debug(`Validating ${items.length} order items...`);
            const orderItemsWithPrices = await this.validateAndPrepareItems(items);
            this.logger.debug('All items validated successfully');
            const subtotalPrice = this.calculateSubtotal(orderItemsWithPrices);
            const totalPrice = this.calculateTotal(subtotalPrice, discount, deliveryFee || 0);
            this.logger.debug(`Order totals calculated: subtotal=${subtotalPrice}, total=${totalPrice}, discount=${discount}%`);
            this.logger.debug('Starting database transaction for order creation...');
            return await this.databaseService.db.transaction(async (tx) => {
                const orderValues = {
                    address,
                    driverId,
                    clientId,
                    restaurantId,
                    subtotalPrice: subtotalPrice.toString(),
                    totalPrice: totalPrice.toString(),
                };
                if (createOrderDto.status) {
                    orderValues.status = createOrderDto.status;
                }
                if (createOrderDto.deliveryFee !== undefined) {
                    orderValues.deliveryFee = createOrderDto.deliveryFee;
                }
                if (createOrderDto.discount !== undefined) {
                    orderValues.discount = createOrderDto.discount;
                }
                const [newOrder] = await tx
                    .insert(schema_1.orders)
                    .values(orderValues)
                    .returning();
                if (!newOrder) {
                    throw new common_1.BadRequestException('Failed to create order');
                }
                const orderItemsToInsert = orderItemsWithPrices.map((item) => ({
                    orderId: newOrder.id,
                    menuId: item.menuId,
                    quantity: item.quantity,
                    price: item.price,
                    notes: item.notes || null,
                }));
                const formattedOrderItems = orderItemsToInsert.map((item) => ({
                    orderId: item.orderId,
                    menuId: item.menuId,
                    quantity: item.quantity,
                    price: item.price.toString(),
                    notes: item.notes,
                }));
                const createdOrderItems = await tx
                    .insert(schema_1.orderItems)
                    .values(formattedOrderItems)
                    .returning();
                const result = {
                    ...newOrder,
                    items: createdOrderItems,
                };
                this.logger.log(`Order #${newOrder.id} created successfully with ${createdOrderItems.length} items`);
                return result;
            });
        }
        catch (error) {
            this.logger.error(`Failed to create order: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to create order: ${error.message}`);
        }
    }
    async findAll(restaurantId) {
        this.logger.log(`Finding all orders for restaurant ID: ${restaurantId}`);
        try {
            this.logger.debug(`Validating restaurant ID: ${restaurantId}`);
            const restaurant = await this.databaseService.db.query.restaurants.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.restaurants.id, restaurantId),
            });
            if (!restaurant) {
                this.logger.warn(`Restaurant with ID ${restaurantId} not found or has incorrect role`);
                throw new common_1.NotFoundException(`Restaurant with ID ${restaurantId} not found or is not a restaurant`);
            }
            this.logger.debug(`Restaurant validated: ${restaurant.name}`);
            const restaurantOrders = await this.databaseService.db
                .select({
                id: schema_1.orders.id,
                address: schema_1.orders.address,
                status: schema_1.orders.status,
                totalPrice: schema_1.orders.totalPrice,
                subtotalPrice: schema_1.orders.subtotalPrice,
                discount: schema_1.orders.discount,
                deliveryFee: schema_1.orders.deliveryFee,
                createdAt: schema_1.orders.createdAt,
                updatedAt: schema_1.orders.updatedAt,
                client: {
                    id: schema_1.users.id,
                    name: schema_1.users.name,
                    phone: schema_1.users.phone,
                    address: schema_1.users.address,
                },
            })
                .from(schema_1.orders)
                .where((0, drizzle_orm_1.eq)(schema_1.orders.restaurantId, restaurantId))
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.orders.clientId, schema_1.users.id))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.orders.createdAt));
            this.logger.log(`Found ${restaurantOrders.length} orders for restaurant ID: ${restaurantId}`);
            return restaurantOrders;
        }
        catch (error) {
            this.logger.error(`Error retrieving orders for restaurant ${restaurantId}: ${error.message}`, error.stack);
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to get orders for restaurant: ${error.message}`);
        }
    }
    async findOne(id) {
        try {
            const [orderData] = await this.databaseService.db
                .select({
                order: {
                    id: schema_1.orders.id,
                    address: schema_1.orders.address,
                    status: schema_1.orders.status,
                    totalPrice: schema_1.orders.totalPrice,
                    subtotalPrice: schema_1.orders.subtotalPrice,
                    discount: schema_1.orders.discount,
                    deliveryFee: schema_1.orders.deliveryFee,
                    driverId: schema_1.orders.driverId,
                    clientId: schema_1.orders.clientId,
                    restaurantId: schema_1.orders.restaurantId,
                    createdAt: schema_1.orders.createdAt,
                    updatedAt: schema_1.orders.updatedAt,
                },
            })
                .from(schema_1.orders)
                .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id));
            if (!orderData) {
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            const relatedUserIds = [
                orderData.order.clientId,
                orderData.order.restaurantId,
                orderData.order.driverId,
            ];
            const relatedUsers = await this.databaseService.db
                .select({
                id: schema_1.users.id,
                name: schema_1.users.name,
                phone: schema_1.users.phone,
                address: schema_1.users.address,
                role: schema_1.users.role,
            })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.inArray)(schema_1.users.id, relatedUserIds));
            const userMap = new Map(relatedUsers.map((user) => [user.id, user]));
            const orderItemsList = await this.databaseService.db
                .select()
                .from(schema_1.orderItems)
                .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, id));
            return {
                ...orderData.order,
                client: userMap.get(orderData.order.clientId) || null,
                restaurant: userMap.get(orderData.order.restaurantId) || null,
                driver: userMap.get(orderData.order.driverId) || null,
                items: orderItemsList,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to retrieve order: ${error.message}`);
        }
    }
    async getMyOrders(clientId) {
        const results = await this.databaseService.db
            .select({
            order: {
                id: schema_1.orders.id,
                address: schema_1.orders.address,
                status: schema_1.orders.status,
                totalPrice: schema_1.orders.totalPrice,
                subtotalPrice: schema_1.orders.subtotalPrice,
                discount: schema_1.orders.discount,
                deliveryFee: schema_1.orders.deliveryFee,
                createdAt: schema_1.orders.createdAt,
                updatedAt: schema_1.orders.updatedAt,
            },
            client: {
                id: schema_1.users.id,
                name: schema_1.users.name,
                phone: schema_1.users.phone,
                address: schema_1.users.address,
                role: schema_1.users.role,
            },
            restaurant: {
                id: schema_1.orders.restaurantId,
                name: schema_1.users.name,
                phone: schema_1.users.phone,
                address: schema_1.users.address,
                role: schema_1.users.role,
            },
            driverId: schema_1.orders.driverId,
        })
            .from(schema_1.orders)
            .where((0, drizzle_orm_1.eq)(schema_1.orders.clientId, clientId))
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.orders.clientId, schema_1.users.id))
            .leftJoin(schema_1.restaurants, (0, drizzle_orm_1.eq)(schema_1.orders.restaurantId, schema_1.restaurants.id));
        const driverIds = [...new Set(results.map((r) => r.driverId))];
        const drivers = await this.databaseService.db
            .select({
            id: schema_1.users.id,
            name: schema_1.users.name,
            phone: schema_1.users.phone,
            role: schema_1.users.role,
        })
            .from(schema_1.users)
            .where(driverIds.length > 0 ? (0, drizzle_orm_1.inArray)(schema_1.users.id, driverIds) : undefined);
        const driverMap = new Map(drivers.map((d) => [d.id, d]));
        return results.map((result) => ({
            ...result.order,
            client: result.client,
            restaurant: result.restaurant,
            driver: driverMap.get(result.driverId) || null,
        }));
    }
    async update(id, updateOrderDto) {
        try {
            const existingOrder = await this.databaseService.db
                .select()
                .from(schema_1.orders)
                .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id))
                .limit(1);
            if (!existingOrder || existingOrder.length === 0) {
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            const updateValues = {};
            if (updateOrderDto.address !== undefined) {
                updateValues.address = updateOrderDto.address;
            }
            if (updateOrderDto.status !== undefined) {
                updateValues.status = updateOrderDto.status;
            }
            if (updateOrderDto.discount !== undefined) {
                updateValues.discount = updateOrderDto.discount;
            }
            if (updateOrderDto.deliveryFee !== undefined) {
                updateValues.deliveryFee = updateOrderDto.deliveryFee;
            }
            if (updateOrderDto.items && updateOrderDto.items.length > 0) {
                return await this.databaseService.db.transaction(async (tx) => {
                    if (Object.keys(updateValues).length > 0) {
                        await tx.update(schema_1.orders).set(updateValues).where((0, drizzle_orm_1.eq)(schema_1.orders.id, id));
                    }
                    if (updateOrderDto.items && updateOrderDto.items.length > 0) {
                        await tx.delete(schema_1.orderItems).where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, id));
                        const orderItemsWithPrices = await this.validateAndPrepareItems(updateOrderDto.items);
                        const orderItemsToInsert = orderItemsWithPrices.map((item) => ({
                            orderId: id,
                            menuId: item.menuId,
                            quantity: item.quantity,
                            price: item.price,
                            notes: item.notes || null,
                        }));
                        const formattedOrderItems = orderItemsToInsert.map((item) => ({
                            orderId: item.orderId,
                            menuId: item.menuId,
                            quantity: item.quantity,
                            price: item.price.toString(),
                            notes: item.notes,
                        }));
                        await tx.insert(schema_1.orderItems).values(formattedOrderItems);
                    }
                    const [updatedOrder] = await tx
                        .select()
                        .from(schema_1.orders)
                        .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id));
                    const updatedItems = await tx
                        .select()
                        .from(schema_1.orderItems)
                        .where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, id));
                    return {
                        ...updatedOrder,
                        items: updatedItems,
                    };
                });
            }
            else {
                if (Object.keys(updateValues).length === 0) {
                    throw new common_1.BadRequestException('No valid fields to update');
                }
                const [updatedOrder] = await this.databaseService.db
                    .update(schema_1.orders)
                    .set(updateValues)
                    .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id))
                    .returning();
                return updatedOrder;
            }
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update order: ${error.message}`);
        }
    }
    async remove(id) {
        try {
            const existingOrder = await this.databaseService.db
                .select()
                .from(schema_1.orders)
                .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id))
                .limit(1);
            if (!existingOrder || existingOrder.length === 0) {
                throw new common_1.NotFoundException(`Order with ID ${id} not found`);
            }
            return await this.databaseService.db.transaction(async (tx) => {
                await tx.delete(schema_1.orderItems).where((0, drizzle_orm_1.eq)(schema_1.orderItems.orderId, id));
                const [deletedOrder] = await tx
                    .delete(schema_1.orders)
                    .where((0, drizzle_orm_1.eq)(schema_1.orders.id, id))
                    .returning();
                return {
                    success: true,
                    message: `Order with ID ${id} successfully deleted`,
                    deletedOrder,
                };
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to delete order: ${error.message}`);
        }
    }
    async validateParticipants(driverId, clientId, restaurantId) {
        const driver = await this.databaseService.db.query.users.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.id, driverId), (0, drizzle_orm_1.eq)(schema_1.users.role, 'driver')),
        });
        if (!driver) {
            throw new common_1.NotFoundException(`Driver with ID ${driverId} not found or is not a driver`);
        }
        const client = await this.databaseService.db.query.users.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.id, clientId), (0, drizzle_orm_1.eq)(schema_1.users.role, 'client')),
        });
        if (!client) {
            throw new common_1.NotFoundException(`Client with ID ${clientId} not found or is not a client`);
        }
        const restaurant = await this.databaseService.db.query.restaurants.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.restaurants.id, restaurantId),
        });
        if (!restaurant) {
            throw new common_1.NotFoundException(`Restaurant with ID ${restaurantId} not found or is not a restaurant`);
        }
    }
    async validateAndPrepareItems(items) {
        if (!items || items.length === 0) {
            throw new common_1.BadRequestException('Order must contain at least one item');
        }
        const menuIds = items.map((item) => item.menuId);
        const menuData = await this.databaseService.db.query.menu.findMany({
            where: (menu, { inArray }) => inArray(menu.id, menuIds),
        });
        const menuMap = new Map(menuData.map((m) => [m.id, m]));
        return items.map((item) => {
            const menuItem = menuMap.get(item.menuId);
            if (!menuItem) {
                throw new common_1.NotFoundException(`Menu item with ID ${item.menuId} not found`);
            }
            const price = Number(menuItem.price);
            if (isNaN(price)) {
                throw new common_1.BadRequestException(`Invalid price for menu item ${menuItem.id}`);
            }
            return {
                ...item,
                price,
            };
        });
    }
    calculateSubtotal(items) {
        return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    }
    calculateTotal(subtotal, discount, deliveryFee) {
        const discountAmount = (subtotal * discount) / 100;
        return subtotal - discountAmount + deliveryFee;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map