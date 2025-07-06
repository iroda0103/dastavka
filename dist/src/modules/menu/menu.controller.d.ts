import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
export declare class MenuController {
    private readonly productsService;
    constructor(productsService: MenuService);
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
    findOne(id: string): string;
    update(id: string, updateProductDto: UpdateMenuDto): string;
    remove(id: string): string;
}
