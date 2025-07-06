import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../../database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [DatabaseModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '3d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
