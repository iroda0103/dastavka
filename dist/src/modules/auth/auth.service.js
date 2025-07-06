"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const schema_1 = require("../../database/schema");
const drizzle_orm_1 = require("drizzle-orm");
const jwt_1 = require("@nestjs/jwt");
const database_service_1 = require("../../database/database.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(databaseService, jwtService) {
        this.databaseService = databaseService;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login({ phone, password }) {
        this.logger.log(`Login attempt with phone: ${phone}`);
        try {
            const [user] = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.phone, phone));
            if (!user) {
                this.logger.warn(`Login failed: User with phone ${phone} not found`);
                throw new common_1.NotFoundException({ message: 'User not found' });
            }
            this.logger.debug(`Verifying password for user ID: ${user.id}`);
            if (!(await this.comparePasswords(password, user.password))) {
                this.logger.warn(`Login failed: Incorrect password for user ${user.id}`);
                throw new common_1.UnauthorizedException({
                    message: 'Email or password incorrect',
                });
            }
            if (!process.env.JWT_SECRET) {
                this.logger.error('JWT_SECRET is missing in environment variables');
                throw new Error('JWT_SECRET is missing. Please check your configuration.');
            }
            this.logger.debug(`Generating JWT token for user ID: ${user.id}`);
            const token = this.jwtService.sign({
                user: { id: user.id, role: user.role },
            }, {
                secret: process.env.JWT_SECRET,
                expiresIn: '30d',
            });
            this.logger.log(`User ${user.id} logged in successfully`);
            return { ...user, token: token };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            this.logger.error(`Login error: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Login failed: ${error.message}`);
        }
    }
    async register(createUser) {
        this.logger.log(`Registering new user with phone: ${createUser.phone}`);
        try {
            this.logger.debug(`Checking if phone ${createUser.phone} already exists`);
            const user = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.phone, createUser.phone));
            if (user.length) {
                this.logger.warn(`Registration failed: Phone ${createUser.phone} already exists`);
                throw new common_1.BadRequestException({ message: 'User already exists' });
            }
            let password = '';
            if (createUser.password) {
                this.logger.debug('Hashing password for new user');
                const salt = await bcrypt.genSalt();
                password = await bcrypt.hash(createUser.password, salt);
                this.logger.debug(`Creating new user with role: ${createUser.role}`);
                const result = await this.databaseService.db
                    .insert(schema_1.users)
                    .values({
                    phone: createUser.phone,
                    role: createUser.role,
                    password: password,
                    name: createUser.name,
                    address: createUser.address,
                    telegramId: createUser.telegramId,
                })
                    .returning();
                this.logger.log(`User registered successfully with ID: ${result[0].id}`);
                return result;
            }
            else {
                this.logger.debug(`Creating user without password, role: ${createUser.role}`);
                const result = await this.databaseService.db
                    .insert(schema_1.users)
                    .values({
                    phone: createUser.phone,
                    role: createUser.role,
                    name: createUser.name,
                    address: createUser.address,
                    telegramId: createUser.telegramId,
                })
                    .returning();
                console.log(result);
                this.logger.log(`User registered successfully with ID: ${result[0].id}`);
                return result;
            }
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException) {
                throw err;
            }
            this.logger.error(`Registration error: ${err.message}`, err.stack);
            return err.message;
        }
    }
    async getMe(user_id) {
        this.logger.log(`Getting profile for user ID: ${user_id}`);
        try {
            const user = await this.databaseService.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, user_id));
            if (!user.length) {
                this.logger.warn(`Get profile failed: User with ID ${user_id} not found`);
                throw new common_1.NotFoundException('User not found');
            }
            this.logger.debug(`Retrieved profile for user ID: ${user_id}, role: ${user[0].role}`);
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            this.logger.error(`Get profile error: ${error.message}`, error.stack);
            throw new common_1.BadRequestException(`Failed to get profile: ${error.message}`);
        }
    }
    async comparePasswords(enteredPass, storedPass) {
        this.logger.debug('Comparing password hashes');
        try {
            return await bcrypt.compare(enteredPass, storedPass);
        }
        catch (error) {
            this.logger.error(`Password comparison error: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Password comparison failed');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map