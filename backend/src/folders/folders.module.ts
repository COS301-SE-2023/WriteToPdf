import { Module } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Folder])],
  providers: [FoldersService],
})
export class FoldersModule {}
