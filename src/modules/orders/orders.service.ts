import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DatabaseService } from '../../database/database.service';
import { orderItems, orders, users, restaurants } from '../../database/schema';
import { and, desc, eq, inArray } from 'drizzle-orm';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly databaseService: DatabaseService) { }

  async create(createOrderDto: CreateOrderDto) {
    this.logger.log(
      `Creating new order for restaurant ID: ${createOrderDto.restaurantId}`,
    );

    // Using menuId in items to refer to menu.id
    try {
      // Destructure the DTO
      const {
        address,
        driverId,
        paymentMethod,
        deliveryMethod,
        comment,
        clientId,
        restaurantId,
        items,
        discount = 0,
        deliveryFee = 0, // Changed from string to number
      } = createOrderDto;

      this.logger.debug(
        `Order params: client=${clientId}, driver=${driverId}, items=${items.length}`,
      );

      // Validate all participants exist
      this.logger.debug('Validating participants...');
      await this.validateParticipants(driverId, clientId, restaurantId);
      this.logger.debug('All participants validated successfully');

      // Validate menu and calculate prices
      this.logger.debug(`Validating ${items.length} order items...`);
      const orderItemsWithPrices = await this.validateAndPrepareItems(items);
      this.logger.debug('All items validated successfully');

      // Calculate order totals
      const subtotalPrice = this.calculateSubtotal(orderItemsWithPrices);
      const totalPrice = this.calculateTotal(
        subtotalPrice,
        discount,
        deliveryFee || 0, // Now directly a number from DTO, with fallback
      );

      this.logger.debug(
        `Order totals calculated: subtotal=${subtotalPrice}, total=${totalPrice}, discount=${discount}%`,
      );

      // Start a transaction
      this.logger.debug('Starting database transaction for order creation...');
      return await this.databaseService.db.transaction(async (tx) => {
        // Create order values object
        const orderValues: any = {
          address,
          driverId,
          clientId,
          restaurantId,
          paymentMethod,
          deliveryMethod,
          comment,
          subtotalPrice: subtotalPrice.toString(),
          totalPrice: totalPrice.toString(),
        };

        // Add optional fields if provided in the DTO
        if (createOrderDto.status) {
          orderValues.status = createOrderDto.status;
        }
        if (createOrderDto.paymentMethod) {
          orderValues.payment_method = createOrderDto.paymentMethod;
        }

        if (createOrderDto.deliveryFee !== undefined) {
          orderValues.deliveryFee = createOrderDto.deliveryFee;
        }

        if (createOrderDto.discount !== undefined) {
          orderValues.discount = createOrderDto.discount;
        }

        // Create order
        const [newOrder] = await tx
          .insert(orders)
          .values(orderValues)
          .returning();

        if (!newOrder) {
          throw new BadRequestException('Failed to create order');
        }

        // Create order items
        const orderItemsToInsert = orderItemsWithPrices.map((item) => ({
          orderId: newOrder.id,
          menuId: item.menuId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || null,
        }));

        // Convert to the correct format expected by the schema
        const formattedOrderItems = orderItemsToInsert.map((item) => ({
          orderId: item.orderId,
          menuId: item.menuId, // Use menuId directly from the item
          quantity: item.quantity,
          price: item.price.toString(), // Convert to string as required by schema
          notes: item.notes,
        }));

        const createdOrderItems = await tx
          .insert(orderItems)
          .values(formattedOrderItems)
          .returning();

        const result = {
          ...newOrder,
          items: createdOrderItems,
        };

        this.logger.log(
          `Order #${newOrder.id} created successfully with ${createdOrderItems.length} items`,
        );
        return result;
      });
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async findAll(restaurantId: number) {
    this.logger.log(`Finding all orders for restaurant ID: ${restaurantId}`);

    try {
      // First validate the restaurant exists with the correct role
      this.logger.debug(`Validating restaurant ID: ${restaurantId}`);
      const restaurant =
        await this.databaseService.db.query.restaurants.findFirst({
          where: eq(restaurants.id, restaurantId),
        });

      if (!restaurant) {
        this.logger.warn(
          `Restaurant with ID ${restaurantId} not found or has incorrect role`,
        );
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found or is not a restaurant`,
        );
      }

      this.logger.debug(`Restaurant validated: ${restaurant.name}`);

      // Get orders with client information in a single query
      const restaurantOrders = await this.databaseService.db
        .select({
          id: orders.id,
          address: orders.address,
          status: orders.status,
          totalPrice: orders.totalPrice,
          subtotalPrice: orders.subtotalPrice,
          discount: orders.discount,
          deliveryFee: orders.deliveryFee,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          client: {
            id: users.id,
            name: users.name,
            phone: users.phone,
            address: users.address,
          },
        })
        .from(orders)
        .where(eq(orders.restaurantId, restaurantId))
        .leftJoin(users, eq(orders.clientId, users.id))
        .orderBy(desc(orders.createdAt));

      // It's not always an error to have no orders
      // Return empty array instead of throwing error
      this.logger.log(
        `Found ${restaurantOrders.length} orders for restaurant ID: ${restaurantId}`,
      );

      return restaurantOrders;
    } catch (error) {
      this.logger.error(
        `Error retrieving orders for restaurant ${restaurantId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      // Use a proper NestJS exception for consistent error handling
      throw new BadRequestException(
        `Failed to get orders for restaurant: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      // Get the order with a single query including all related data
      const [orderData] = await this.databaseService.db
        .select({
          order: {
            id: orders.id,
            address: orders.address,
            status: orders.status,
            totalPrice: orders.totalPrice,
            subtotalPrice: orders.subtotalPrice,
            discount: orders.discount,
            deliveryFee: orders.deliveryFee,
            driverId: orders.driverId,
            clientId: orders.clientId,
            restaurantId: orders.restaurantId,
            createdAt: orders.createdAt,
            updatedAt: orders.updatedAt,
          },
        })
        .from(orders)
        .where(eq(orders.id, id));

      if (!orderData) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Fetch related users in a single query
      const relatedUserIds = [
        orderData.order.clientId,
        orderData.order.restaurantId,
        orderData.order.driverId,
      ];

      const relatedUsers = await this.databaseService.db
        .select({
          id: users.id,
          name: users.name,
          phone: users.phone,
          address: users.address,
          role: users.role,
        })
        .from(users)
        .where(inArray(users.id, relatedUserIds));

      // Create a map for quick lookups
      const userMap = new Map(relatedUsers.map((user) => [user.id, user]));

      // Fetch the order items
      const orderItemsList = await this.databaseService.db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, id));

      // Return the complete order with all related data
      return {
        ...orderData.order,
        client: userMap.get(orderData.order.clientId) || null,
        restaurant: userMap.get(orderData.order.restaurantId) || null,
        driver: userMap.get(orderData.order.driverId) || null,
        items: orderItemsList,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to retrieve order: ${error.message}`,
      );
    }
  }

  async getMyOrders(clientId: string) {
    // Single efficient query with multiple joins instead of N+1 separate queries
    const results = await this.databaseService.db
      .select({
        // Order data
        order: {
          id: orders.id,
          address: orders.address,
          status: orders.status,
          totalPrice: orders.totalPrice,
          subtotalPrice: orders.subtotalPrice,
          discount: orders.discount,
          deliveryFee: orders.deliveryFee,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
        },
        // Client data (though we already know the client)
        client: {
          id: users.id,
          name: users.name,
          phone: users.phone,
          address: users.address,
          role: users.role,
        },
        // Restaurant data - using aliased join
        restaurant: {
          id: orders.restaurantId,
          name: restaurants.name,
          phone: restaurants.phone,

          // address: re.address,
          // role: users.role,
        },
        // Driver data - will use a later join
        driverId: orders.driverId,
      })
      .from(orders)
      .where(eq(users.telegramId, clientId))
      .leftJoin(users, eq(orders.clientId, users.id))
      // For restaurant data, we need an alias since we're joining the same table
      .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id));

    // Now we need to fetch driver data
    // We'll do a single query for all drivers
    const driverIds = [...new Set(results.map((r) => r.driverId))];
    const drivers = await this.databaseService.db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        role: users.role,
      })
      .from(users)
      .where(driverIds.length > 0 ? inArray(users.id, driverIds) : undefined);

    // Create a map for quick driver lookup
    const driverMap = new Map(drivers.map((d) => [d.id, d]));

    // Combine the data
    return results.map((result) => ({
      ...result.order,
      client: result.client,
      restaurant: result.restaurant,
      driver: driverMap.get(result.driverId) || null,
    }));
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    try {
            console.log('start test',updateOrderDto);

      // First check if the order exists
      const existingOrder = await this.databaseService.db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);

      if (!existingOrder || existingOrder.length === 0) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Create update values
      // Define all possible fields that can be updated
      const updateValues: {
        address?: string;
        status?: string;
        driverId?: number,
        discount?: number;
        deliveryFee?: number;
      } = {};
      console.log('test',updateOrderDto);

      // Only update the fields that are provided
      if (updateOrderDto.address !== undefined) {
        updateValues.address = updateOrderDto.address;
      }

      if (updateOrderDto.status !== undefined) {
        updateValues.status = updateOrderDto.status;
      }
      console.log('finish',updateOrderDto,updateValues);

      if (updateOrderDto.discount !== undefined) {
        updateValues.discount = updateOrderDto.discount;
      }

      if (updateOrderDto.deliveryFee !== undefined) {
        updateValues.deliveryFee = updateOrderDto.deliveryFee;
      }

      // Use a transaction if we're updating related items too
      if (updateOrderDto.items && updateOrderDto.items.length > 0) {
        return await this.databaseService.db.transaction(async (tx) => {
          // Update the order first
          if (Object.keys(updateValues).length > 0) {
            // Create a set object for the update without updatedAt
            await tx.update(orders).set(updateValues).where(eq(orders.id, id));
          }

          // Handle items updates
          // For simplicity, we'll just delete existing items and insert new ones
          // In a real app, you'd want to do this more carefully to preserve data
          if (updateOrderDto.items && updateOrderDto.items.length > 0) {
            // Delete existing items
            await tx.delete(orderItems).where(eq(orderItems.orderId, id));

            // Prepare and validate the new items
            const orderItemsWithPrices = await this.validateAndPrepareItems(
              updateOrderDto.items,
            );

            // Insert new items
            const orderItemsToInsert = orderItemsWithPrices.map((item) => ({
              orderId: id,
              menuId: item.menuId,
              quantity: item.quantity,
              price: item.price,
              notes: item.notes || null,
            }));

            // Convert to the correct format expected by the schema
            const formattedOrderItems = orderItemsToInsert.map((item) => ({
              orderId: item.orderId,
              menuId: item.menuId, // Use menuId directly from the item
              quantity: item.quantity,
              price: item.price.toString(), // Convert to string as required by schema
              notes: item.notes,
            }));

            await tx.insert(orderItems).values(formattedOrderItems);
          }

          // Return the updated order
          const [updatedOrder] = await tx
            .select()
            .from(orders)
            .where(eq(orders.id, id));

          const updatedItems = await tx
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, id));

          return {
            ...updatedOrder,
            items: updatedItems,
          };
        });
      } else {
        // Simple update without items
        if (Object.keys(updateValues).length === 0) {
          throw new BadRequestException('No valid fields to update');
        }

        // Update the order - don't set updatedAt directly
        const [updatedOrder] = await this.databaseService.db
          .update(orders)
          .set(updateValues)
          .where(eq(orders.id, id))
          .returning();

        return updatedOrder;
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(`Failed to update order: ${error.message}`);
    }
  }

  async remove(id: number) {
    try {
      // Check if the order exists first
      const existingOrder = await this.databaseService.db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);

      if (!existingOrder || existingOrder.length === 0) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Use a transaction to handle deletion of order and related items
      return await this.databaseService.db.transaction(async (tx) => {
        // Delete related order items first (foreign key constraint)
        await tx.delete(orderItems).where(eq(orderItems.orderId, id));

        // Then delete the order itself
        const [deletedOrder] = await tx
          .delete(orders)
          .where(eq(orders.id, id))
          .returning();

        return {
          success: true,
          message: `Order with ID ${id} successfully deleted`,
          deletedOrder,
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete order: ${error.message}`);
    }
  }

  private async validateParticipants(
    driverId: number,
    clientId: number,
    restaurantId: number,
  ): Promise<void> {
    // Check if driver exists
    const driver = await this.databaseService.db.query.users.findFirst({
      where: and(eq(users.id, driverId), eq(users.role, 'driver')),
    });

    if (!driver && driverId) {
      throw new NotFoundException(
        `Driver with ID ${driverId} not found or is not a driver`,
      );
    }

    // Check if client exists
    const client = await this.databaseService.db.query.users.findFirst({
      where: and(eq(users.id, clientId), eq(users.role, 'client')),
    });

    if (!client) {
      throw new NotFoundException(
        `Client with ID ${clientId} not found or is not a client`,
      );
    }

    // Check if restaurant exists
    const restaurant =
      await this.databaseService.db.query.restaurants.findFirst({
        where: eq(restaurants.id, restaurantId),
      });

    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found or is not a restaurant`,
      );
    }
  }

  private async validateAndPrepareItems(
    items: CreateOrderItemDto[],
  ): Promise<Array<CreateOrderItemDto & { price: number }>> {
    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const menuIds = items.map((item) => item.menuId);

    // Fetch all menu items in one query for efficiency
    const menuData = await this.databaseService.db.query.menu.findMany({
      where: (menu, { inArray }) => inArray(menu.id, menuIds),
    });

    const menuMap = new Map(menuData.map((m) => [m.id, m]));

    return items.map((item) => {
      const menuItem = menuMap.get(item.menuId);

      if (!menuItem) {
        throw new NotFoundException(
          `Menu item with ID ${item.menuId} not found`,
        );
      }

      // Access the price directly as a number
      const price = Number(menuItem.price);
      if (isNaN(price)) {
        throw new BadRequestException(
          `Invalid price for menu item ${menuItem.id}`,
        );
      }

      return {
        ...item,
        price,
      };
    });
  }

  private calculateSubtotal(
    items: Array<{ quantity: number; price: number }>,
  ): number {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  private calculateTotal(
    subtotal: number,
    discount: number,
    deliveryFee: number,
  ): number {
    // Calculate discount amount
    const discountAmount = (subtotal * discount) / 100;

    // Apply the discount and add delivery fee
    return subtotal - discountAmount + deliveryFee;
  }
}
