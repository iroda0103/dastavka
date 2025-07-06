import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}
