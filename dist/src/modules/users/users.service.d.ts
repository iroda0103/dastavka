import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../../database/database.service';
import { CustomLoggerService } from '../../logger/logger.service';
export declare class UsersService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService, logger: CustomLoggerService);
    private buildLogMessage;
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
    findAll(role?: string, telegramId?: string): Promise<{
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
    findById(id: number): Promise<{
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
    findOne(telegramId: string): Promise<{
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
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
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
    remove(id: number): Promise<{
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
