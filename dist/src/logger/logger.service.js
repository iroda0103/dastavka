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
exports.CustomLoggerService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
let CustomLoggerService = class CustomLoggerService {
    constructor() {
        this.logLevels = ['error', 'warn', 'log', 'debug', 'verbose'];
        this.logsDir = path.join(process.cwd(), 'logs');
        this.ensureLogDirectoryExists();
    }
    ensureLogDirectoryExists() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir);
        }
        const todayDir = this.getTodayLogDir();
        if (!fs.existsSync(todayDir)) {
            fs.mkdirSync(todayDir);
        }
    }
    getTodayLogDir() {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0];
        return path.join(this.logsDir, dateString);
    }
    getLogFilePath(level) {
        const todayDir = this.getTodayLogDir();
        return path.join(todayDir, `${level}.log`);
    }
    formatMessage(message, context) {
        const timestamp = new Date().toISOString();
        const contextInfo = context ? `[${context}] ` : '';
        const msg = typeof message === 'object' ? JSON.stringify(message) : message;
        return `${timestamp} ${contextInfo}${msg}`;
    }
    writeLog(level, message, context) {
        try {
            this.ensureLogDirectoryExists();
            const formattedMessage = this.formatMessage(message, context);
            const logFilePath = this.getLogFilePath(level);
            fs.appendFileSync(logFilePath, formattedMessage + '\n');
            const combinedLogPath = path.join(this.getTodayLogDir(), 'combined.log');
            fs.appendFileSync(combinedLogPath, `[${level.toUpperCase()}] ${formattedMessage}\n`);
        }
        catch (error) {
            console.error('Error writing to log file:', error);
        }
    }
    log(message, context) {
        this.writeLog('log', message, context);
        console.log(`[${context}] ${message}`);
    }
    error(message, trace, context) {
        const errorMsg = trace ? `${message}\n${trace}` : message;
        this.writeLog('error', errorMsg, context);
        console.error(`[${context}] ${message}`);
    }
    warn(message, context) {
        this.writeLog('warn', message, context);
        console.warn(`[${context}] ${message}`);
    }
    debug(message, context) {
        this.writeLog('debug', message, context);
        console.debug(`[${context}] ${message}`);
    }
    verbose(message, context) {
        this.writeLog('verbose', message, context);
        console.log(`[VERBOSE] [${context}] ${message}`);
    }
};
exports.CustomLoggerService = CustomLoggerService;
exports.CustomLoggerService = CustomLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CustomLoggerService);
//# sourceMappingURL=logger.service.js.map