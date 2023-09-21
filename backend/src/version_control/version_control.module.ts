import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiffsService } from '../diffs/diffs.service';
import { SnapshotService } from '../snapshots/snapshots.service';
import { Diff } from '../diffs/entities/diffs.entity';
import { Snapshot } from '../snapshots/entities/snapshots.entity';
import { VersionControlController } from './version_control.controller';
import { VersionControlService } from './version_control.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Diff]),
    TypeOrmModule.forFeature([Snapshot]),
    TypeOrmModule.forFeature([MarkdownFile]),
  ],
  controllers: [VersionControlController],
  providers: [
    DiffsService,
    SnapshotService,
    VersionControlService,
    MarkdownFilesService,
    S3Service,
    S3ServiceMock,
  ],
})
export class VersionControlModule {}
