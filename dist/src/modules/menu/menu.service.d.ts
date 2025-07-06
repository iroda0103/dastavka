import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { DatabaseService } from '../../database/database.service';
export declare class MenuService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    create(createProductDto: CreateMenuDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        image: string;
        restaurantId: number;
        price: string;
    }>;
    findAll(restaurantId: number): Promise<{
        id: number;
        name: string;
        description: string;
        image: string;
        price: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): string;
    update(id: number, updateProductDto: UpdateMenuDto): string;
    remove(id: number): string;
}
