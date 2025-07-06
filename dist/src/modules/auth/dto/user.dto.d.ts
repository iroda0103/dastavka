export declare class LoginUserDto {
    phone: string;
    password: string;
}
export declare class RegisterUserDto {
    phone: string;
    password: string;
    name: string;
    address: string;
    telegramId?: string;
    role: 'admin' | 'restaurant' | 'client' | 'driver' | 'chef';
}
