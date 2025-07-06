"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const database_module_1 = require("./database/database.module");
const config_1 = require("@nestjs/config");
const users_module_1 = require("./modules/users/users.module");
const orders_module_1 = require("./modules/orders/orders.module");
const jwt_1 = require("@nestjs/jwt");
const menu_module_1 = require("./modules/menu/menu.module");
const restaurants_module_1 = require("./modules/restaurants/restaurants.module");
const cities_module_1 = require("./modules/cities/cities.module");
const upload_module_1 = require("./upload/upload.module");
const logger_module_1 = require("./logger/logger.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            logger_module_1.LoggerModule,
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            menu_module_1.MenuModule,
            restaurants_module_1.RestaurantsModule,
            cities_module_1.CitiesModule,
            upload_module_1.UploadModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, jwt_1.JwtService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map