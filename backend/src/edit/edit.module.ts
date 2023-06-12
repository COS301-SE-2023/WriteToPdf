import { Module } from '@nestjs/common';
import { EditService } from './edit.service';

@Module({
  providers: [EditService],
})
export class EditModule {}
