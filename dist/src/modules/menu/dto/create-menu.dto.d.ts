export declare class CreateMenuDto {
    name: string;
    restaurantId: number;
    description?: string;
    image: string;
    price: number;
}
export declare class ProductsFilterDto {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
}
export declare class PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
