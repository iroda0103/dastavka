import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        password: string;
        phone: string;
        name: string;
        address: string;
        telegramId: string;
        role: "admin" | "restaurant" | "client" | "driver" | "chef";
        id: number;
        createdAt: Date;
        updatedAt: Date;
        cityId: number;
    }[]>;
    getOnlyRestaurants(): Promise<{
        id: number;
        name: string;
        phone: string;
        password: string;
        address: string;
        role: "admin" | "restaurant" | "client" | "driver" | "chef";
        telegramId: string;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findAll(role: string, telegramId: string): Promise<{
        id: number;
        name: string;
        phone: string;
        password: string;
        address: string;
        role: "admin" | "restaurant" | "client" | "driver" | "chef";
        telegramId: string;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(telegramId: string): Promise<{}>;
    findById(id: string): Promise<{
        id: number;
        name: string;
        phone: string;
        password: string;
        address: string;
        role: "admin" | "restaurant" | "client" | "driver" | "chef";
        telegramId: string;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: number;
        name: string;
        phone: string;
        password: string;
        address: string;
        role: "admin" | "restaurant" | "client" | "driver" | "chef";
        telegramId: string;
        cityId: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    remove(id: string): Promise<{
        password: string;
        phone: string;
        name: string;
        address: string;
        telegramId: string;
        role: "admin" | "restaurant" | "client" | "driver" | "chef";
        id: number;
        createdAt: Date;
        updatedAt: Date;
        cityId: number;
    }[]>;
}
