export declare enum OrderStatus {
    NEW = "new",
    PROCESS = "process",
    ON_WAY = "on-way",
    DELIVERED = "delivered",
    CANCEL = "cancel"
}
export declare enum PaymentMethod {
    CASH = "cash",
    CARD = "card",
    ONLINE = "online"
}
export declare enum DeliveryMethod {
    DELIVERY = "delivery",
    CARD = "pickup"
}
export declare class CreateOrderDto {
    address: string;
    driverId: number;
    paymentMethod: PaymentMethod;
    clientId: number;
    deliveryMethod: DeliveryMethod;
    restaurantId: number;
    items: CreateOrderItemDto[];
    status: OrderStatus;
    discount: number;
    deliveryFee: number;
    comment: string;
}
export declare class CreateOrderItemDto {
    menuId: number;
    quantity: number;
    notes?: string;
}
