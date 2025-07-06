import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto): Promise<{
        items: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            price: string;
            orderId: number;
            menuId: number;
            quantity: number;
            notes: string;
        }[];
        address: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: "new" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
        totalPrice: string;
        subtotalPrice: string;
        isDeleted: boolean;
        discount: number;
        deliveryFee: string;
        paymentMethod: "cash" | "card" | "online";
        paymentStatus: "pending" | "paid" | "failed" | "refunded";
        estimatedDeliveryTime: Date;
        deliveredAt: Date;
        restaurantRating: number;
        deliveryRating: number;
        driverId: number;
        clientId: number;
        restaurantId: number;
    }>;
    findAll(restaurantId: number): Promise<{
        id: number;
        address: string;
        status: "new" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
        totalPrice: string;
        subtotalPrice: string;
        discount: number;
        deliveryFee: string;
        createdAt: Date;
        updatedAt: Date;
        client: {
            id: number;
            name: string;
            phone: string;
            address: string;
        };
    }[]>;
    getMyOrders(userId: string): Promise<{
        client: {
            id: number;
            name: string;
            phone: string;
            address: string;
            role: "admin" | "restaurant" | "client" | "driver" | "chef";
        };
        restaurant: {
            id: number;
            name: string;
            phone: string;
            address: string;
            role: "admin" | "restaurant" | "client" | "driver" | "chef";
        };
        driver: {
            id: number;
            name: string;
            phone: string;
            role: "admin" | "restaurant" | "client" | "driver" | "chef";
        };
        id: number;
        address: string;
        status: "new" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
        totalPrice: string;
        subtotalPrice: string;
        discount: number;
        deliveryFee: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        client: {
            id: number;
            name: string;
            phone: string;
            address: string;
            role: "admin" | "restaurant" | "client" | "driver" | "chef";
        };
        restaurant: {
            id: number;
            name: string;
            phone: string;
            address: string;
            role: "admin" | "restaurant" | "client" | "driver" | "chef";
        };
        driver: {
            id: number;
            name: string;
            phone: string;
            address: string;
            role: "admin" | "restaurant" | "client" | "driver" | "chef";
        };
        items: {
            id: number;
            orderId: number;
            menuId: number;
            quantity: number;
            price: string;
            notes: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        id: number;
        address: string;
        status: "new" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
        totalPrice: string;
        subtotalPrice: string;
        discount: number;
        deliveryFee: string;
        driverId: number;
        clientId: number;
        restaurantId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<{
        id: number;
        address: string;
        status: "new" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
        totalPrice: string;
        subtotalPrice: string;
        isDeleted: boolean;
        discount: number;
        deliveryFee: string;
        paymentMethod: "cash" | "card" | "online";
        paymentStatus: "pending" | "paid" | "failed" | "refunded";
        estimatedDeliveryTime: Date;
        deliveredAt: Date;
        restaurantRating: number;
        deliveryRating: number;
        driverId: number;
        clientId: number;
        restaurantId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        deletedOrder: {
            address: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            status: "new" | "confirmed" | "preparing" | "ready_for_pickup" | "out_for_delivery" | "delivered" | "cancelled";
            totalPrice: string;
            subtotalPrice: string;
            isDeleted: boolean;
            discount: number;
            deliveryFee: string;
            paymentMethod: "cash" | "card" | "online";
            paymentStatus: "pending" | "paid" | "failed" | "refunded";
            estimatedDeliveryTime: Date;
            deliveredAt: Date;
            restaurantRating: number;
            deliveryRating: number;
            driverId: number;
            clientId: number;
            restaurantId: number;
        };
    }>;
}
