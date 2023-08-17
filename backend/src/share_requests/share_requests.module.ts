import { Module } from '@nestjs/common';
import { ShareRequestsService } from './share_requests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareRequest } from './entities/share_request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShareRequest]),
  ],
  providers: [ShareRequestsService],
})
export class ShareRequestsModule {}
