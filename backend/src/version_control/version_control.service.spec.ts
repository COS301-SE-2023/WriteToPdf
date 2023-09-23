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
import { SnapshotService } from '../snapshots/snapshots.service';
import { Snapshot } from '../snapshots/entities/snapshots.entity';
import { DiffDTO } from '../diffs/dto/diffs.dto';

describe('VersionControlService', () => {
  let service: VersionControlService;
  let diffsService: DiffsService;
  let markdownFilesService: MarkdownFilesService;
  let snapshotService: SnapshotService;
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
          SnapshotService,
          {
            provide: getRepositoryToken(Diff),
            useClass: Repository,
          },
          {
            provide:
              getRepositoryToken(MarkdownFile),
            useClass: Repository,
          },
          {
            provide: getRepositoryToken(Snapshot),
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

    snapshotService = module.get<SnapshotService>(
      SnapshotService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveSnapshot', () => {
    const diffDTO = new DiffDTO();
    const nextSnaphshotID = 0;
    it('should call the s3Service and save snapshot correctly', async () => {
      jest.spyOn(s3Service, 'saveSnapshot');

      jest
        .spyOn(Repository.prototype, 'findOne')
        .mockResolvedValueOnce(new Snapshot());

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValueOnce(new Snapshot());

      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValueOnce(
          new MarkdownFile(),
        );

      jest
        .spyOn(Repository.prototype, 'save')
        .mockResolvedValueOnce(
          new MarkdownFile(),
        );

      jest.spyOn(
        snapshotService,
        'updateSnapshot',
      );

      jest.spyOn(
        markdownFilesService,
        'incrementNextSnapshotID',
      );

      const response = await service.saveSnapshot(
        diffDTO,
        nextSnaphshotID,
      );
    });
  });
});
