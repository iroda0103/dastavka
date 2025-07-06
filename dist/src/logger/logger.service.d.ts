import { LoggerService } from '@nestjs/common';
export declare class CustomLoggerService implements LoggerService {
    private readonly logLevels;
    private readonly logsDir;
    constructor();
    private ensureLogDirectoryExists;
    private getTodayLogDir;
    private getLogFilePath;
    private formatMessage;
    private writeLog;
    log(message: any, context?: string): void;
    error(message: any, trace?: string, context?: string): void;
    warn(message: any, context?: string): void;
    debug(message: any, context?: string): void;
    verbose(message: any, context?: string): void;
}
