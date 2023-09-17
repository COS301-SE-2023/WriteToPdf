import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { VersionControlService } from './version_control.service';
import { DiffsService } from '../diffs/diffs.service';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { S3Service } from '../s3/s3.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Diff } from '../diffs/entities/diffs.entity';
import { Repository } from 'typeorm';
import { MarkdownFile } from '../markdown_files/entities/markdown_file.entity';

describe('VersionControlService', () => {
  let service: VersionControlService;
  let diffsService: DiffsService;
  let markdownFilesService: MarkdownFilesService;
  let s3Service: S3Service;
  let s3ServiceMock: S3ServiceMock;

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          VersionControlService,
          DiffsService,
          MarkdownFilesService,
          S3Service,
          S3ServiceMock,
          {
            provide: getRepositoryToken(Diff),
            useClass: Repository,
          },
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
        ],
      }).compile();

    service = module.get<VersionControlService>(
      VersionControlService,
    );

    diffsService =
      module.get<DiffsService>(DiffsService);

    markdownFilesService =
      module.get<MarkdownFilesService>(
        MarkdownFilesService,
      );

    s3Service = module.get<S3Service>(S3Service);

    s3ServiceMock = module.get<S3ServiceMock>(
      S3ServiceMock,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
