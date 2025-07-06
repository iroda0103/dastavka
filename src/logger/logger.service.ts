import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
  private readonly logsDir = path.join(process.cwd(), 'logs');

  constructor() {
    this.ensureLogDirectoryExists();
  }

  private ensureLogDirectoryExists(): void {
    // Create main logs directory if it doesn't exist
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir);
    }

    // Create today's log directory if it doesn't exist
    const todayDir = this.getTodayLogDir();
    if (!fs.existsSync(todayDir)) {
      fs.mkdirSync(todayDir);
    }
  }

  private getTodayLogDir(): string {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    return path.join(this.logsDir, dateString);
  }

  private getLogFilePath(level: string): string {
    const todayDir = this.getTodayLogDir();
    return path.join(todayDir, `${level}.log`);
  }

  private formatMessage(message: any, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? `[${context}] ` : '';
    const msg = typeof message === 'object' ? JSON.stringify(message) : message;
    
    return `${timestamp} ${contextInfo}${msg}`;
  }

  private writeLog(level: string, message: any, context?: string): void {
    try {
      this.ensureLogDirectoryExists(); // Ensure today's directory exists
      const formattedMessage = this.formatMessage(message, context);
      const logFilePath = this.getLogFilePath(level);
      
      fs.appendFileSync(logFilePath, formattedMessage + '\n');
      
      // Also write to combined.log
      const combinedLogPath = path.join(this.getTodayLogDir(), 'combined.log');
      fs.appendFileSync(combinedLogPath, `[${level.toUpperCase()}] ${formattedMessage}\n`);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  log(message: any, context?: string): void {
    this.writeLog('log', message, context);
    console.log(`[${context}] ${message}`);
  }

  error(message: any, trace?: string, context?: string): void {
    const errorMsg = trace ? `${message}\n${trace}` : message;
    this.writeLog('error', errorMsg, context);
    console.error(`[${context}] ${message}`);
  }

  warn(message: any, context?: string): void {
    this.writeLog('warn', message, context);
    console.warn(`[${context}] ${message}`);
  }

  debug(message: any, context?: string): void {
    this.writeLog('debug', message, context);
    console.debug(`[${context}] ${message}`);
  }

  verbose(message: any, context?: string): void {
    this.writeLog('verbose', message, context);
    console.log(`[VERBOSE] [${context}] ${message}`);
  }
}