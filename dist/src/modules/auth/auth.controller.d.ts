import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from './dto/user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginUserDto: LoginUserDto): Promise<{
        token: string;
    } | Error>;
    register(registerUserDto: RegisterUserDto): Promise<any>;
    getMe(req: Request): Promise<{
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
}
