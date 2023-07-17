import { Module } from '@nestjs/common';
import { TextManagerService } from './text_manager.service';
import { TextManagerController } from './text_manager.controller';

@Module({
  controllers: [TextManagerController],
  providers: [TextManagerService],
})
export class TextManagerModule {}
