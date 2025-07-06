import { LoginUserDto, RegisterUserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';
export declare class AuthService {
    private readonly databaseService;
    private jwtService;
    private readonly logger;
    constructor(databaseService: DatabaseService, jwtService: JwtService);
    login({ phone, password }: LoginUserDto): Promise<{
        token: string;
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
    }>;
    register(createUser: RegisterUserDto): Promise<any>;
    getMe(user_id: number): Promise<{
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
    comparePasswords(enteredPass: string, storedPass: string): Promise<boolean>;
}
