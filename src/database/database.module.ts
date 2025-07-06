import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule], // Make sure ConfigModule is imported here
  providers: [
    {
      provide: DatabaseService,
      useFactory: (configService: ConfigService) => {
        return new DatabaseService(configService);
      },
      inject: [ConfigService], // Explicitly inject ConfigService
    },
  ],
  exports: [DatabaseService],
})
export class DatabaseModule {}
