import { DatabaseService } from '../../database/database.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
export declare class RestaurantsService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    create(createRestaurantDto: CreateRestaurantDto): Promise<{
        id: number;
        name: string;
        phone: string;
        image: string;
        address: string;
        category: "fast_food" | "milliy_taom" | "pizza" | "burger";
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
        city: {
            id: number;
            name: string;
        };
    }>;
    private buildCreateData;
    findAll(search?: string, cityFilter?: number): Promise<any>;
    findOne(id: number): Promise<{
        id: number;
        name: string;
        phone: string;
        image: string;
        address: string;
        category: "fast_food" | "milliy_taom" | "pizza" | "burger";
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
        city: {
            id: number;
            name: string;
        };
    }>;
    update(id: number, updateRestaurantDto: UpdateRestaurantDto): Promise<{
        id: number;
        name: string;
        phone: string;
        image: string;
        address: string;
        category: "fast_food" | "milliy_taom" | "pizza" | "burger";
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
        city: {
            id: number;
            name: string;
        };
    }>;
    private validateRestaurantExists;
    private validateUniquePhone;
    private validateCityExists;
    private buildUpdateData;
    remove(id: number): Promise<{
        message: string;
        id: number;
    }>;
    findByCity(cityId: number, page?: number, limit?: number): Promise<{
        data: {
            id: number;
            name: string;
            phone: string;
            image: string;
            address: string;
            category: "fast_food" | "milliy_taom" | "pizza" | "burger";
            cityId: number;
            createdAt: Date;
            updatedAt: Date;
            city: {
                id: number;
                name: string;
            };
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
