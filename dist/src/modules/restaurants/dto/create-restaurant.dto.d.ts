export declare class CreateRestaurantDto {
    name: string;
    phone: string;
    password: string;
    image: string;
    address?: string;
    category: 'fast_food' | 'milliy_taom' | 'pizza' | 'burger';
    cityId: number;
}
