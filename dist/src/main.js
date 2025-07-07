"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./logger/logger.service");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    const logger = app.get(logger_service_1.CustomLoggerService);
    app.useLogger(logger);
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = process.env.PORT ?? 3002;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
//# sourceMappingURL=main.js.map