export declare enum OrderStatus {
    NEW = "new",
    PROCESS = "process",
    ON_WAY = "on-way",
    DELIVERED = "delivered",
    CANCEL = "cancel"
}
export declare class CreateOrderDto {
    address: string;
    driverId: number;
    clientId: number;
    restaurantId: number;
    items: CreateOrderItemDto[];
    status: OrderStatus;
    discount: number;
    deliveryFee: number;
}
export declare class CreateOrderItemDto {
    menuId: number;
    quantity: number;
    notes?: string;
}
