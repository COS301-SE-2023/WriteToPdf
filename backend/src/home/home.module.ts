import { Module } from '@nestjs/common';
import { HomeService } from './home.service';

@Module({
  providers: [HomeService],
})
export class HomeModule {}
