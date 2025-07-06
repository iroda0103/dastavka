import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule, DatabaseModule, JwtModule],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
