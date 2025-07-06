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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HasRole = exports.IsLoggedIn = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let IsLoggedIn = class IsLoggedIn {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new common_1.UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_SECRET'),
            });
            request['user'] = payload['user'];
        }
        catch (err) {
            throw new common_1.UnauthorizedException({
                error: err.message,
                message: err,
            });
        }
        return true;
    }
    extractTokenFromHeader(request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
};
exports.IsLoggedIn = IsLoggedIn;
exports.IsLoggedIn = IsLoggedIn = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], IsLoggedIn);
let HasRole = class HasRole {
    constructor(roles) {
        this.roles = roles;
    }
    async canActivate(context) {
        try {
            const request = context.switchToHttp().getRequest();
            const hasRole = this.roles.some((role) => role === request['user'].role);
            if (!hasRole)
                throw new common_1.ForbiddenException('Access denied');
            return true;
        }
        catch (err) {
            throw new common_1.ForbiddenException('Access denied');
        }
    }
};
exports.HasRole = HasRole;
exports.HasRole = HasRole = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Array])
], HasRole);
//# sourceMappingURL=auth.guard.js.map