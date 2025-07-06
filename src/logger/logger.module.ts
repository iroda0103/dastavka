import { Global, Module } from '@nestjs/common';
import { CustomLoggerService } from './logger.service';

@Global()
@Module({
  providers: [
    {
      provide: CustomLoggerService,
      useClass: CustomLoggerService,
    },
  ],
  exports: [CustomLoggerService],
})
export class LoggerModule {}