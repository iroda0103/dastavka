export declare class CreateUserDto {
    phone: string;
    password?: string;
    name?: string;
    address?: string;
    telegramId?: string;
    role: 'admin' | 'restaurant' | 'client' | 'driver' | 'chef';
    updatedAt?: string;
}
