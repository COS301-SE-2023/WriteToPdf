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
import { SnapshotDTO } from '../snapshots/dto/snapshot.dto';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';

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

      const response = await service.saveSnapshot(
        diffDTO,
        nextSnaphshotID,
        0,
      );

      expect(response).toEqual(undefined);
      expect(
        s3Service.saveSnapshot,
      ).toHaveBeenCalled();
    });

    it('should get all snapshots', async () => {
      const snapshotDTO = new SnapshotDTO();
      jest
        .spyOn(Repository.prototype, 'findOneBy')
        .mockResolvedValueOnce(
          new MarkdownFile(),
        );

      jest
        .spyOn(service, 'getLogicalOrder')
        .mockResolvedValueOnce(
          new Array<number>() as never,
        );

      const response =
        await service.getAllSnapshots(
          snapshotDTO,
        );

      expect(response).toEqual([]);
    });
  });

  describe('createDiff', () => {
    it('should create a diff and save it on s3', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.MarkdownID = 'test';
      diffDTO.UserID = 1;
      const nextDiffIndex = 1;

      const createdMarkdownFileDTO =
        new MarkdownFileDTO();
      createdMarkdownFileDTO.MarkdownID =
        diffDTO.MarkdownID;
      createdMarkdownFileDTO.UserID =
        diffDTO.UserID;
      createdMarkdownFileDTO.NextDiffIndex =
        nextDiffIndex;

      jest
        .spyOn(s3Service, 'saveDiff')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(
          diffsService,
          'createDiffWithoutSnapshotID',
        )
        .mockResolvedValueOnce(diffDTO as any);

      const result = await service.createDiff(
        diffDTO,
        nextDiffIndex,
      );

      expect(result).toEqual(diffDTO);
      expect(
        diffsService.createDiffWithoutSnapshotID,
      ).toHaveBeenCalledWith(
        createdMarkdownFileDTO,
      );
      expect(
        s3Service.saveDiff,
      ).toHaveBeenCalledWith(
        diffDTO,
        nextDiffIndex,
      );
    });
  });

  describe('createSnapshot', () => {
    it('should create a snapshot and save it on s3', async () => {
      const diffDTO = new DiffDTO();
      diffDTO.MarkdownID = 'test';
      diffDTO.UserID = 1;
      const nextSnapshotIndex = 1;

      const createdMarkdownFileDTO =
        new MarkdownFileDTO();
      createdMarkdownFileDTO.MarkdownID =
        diffDTO.MarkdownID;
      createdMarkdownFileDTO.UserID =
        diffDTO.UserID;
      createdMarkdownFileDTO.NextSnapshotIndex =
        nextSnapshotIndex;

      const newSnapshot = new Snapshot();

      jest
        .spyOn(s3Service, 'saveSnapshot')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(snapshotService, 'createSnapshot')
        .mockResolvedValueOnce('test');

      jest
        .spyOn(snapshotService, 'getSnapshotByID')
        .mockResolvedValueOnce(newSnapshot);

      const result = await service.createSnapshot(
        diffDTO,
        nextSnapshotIndex,
      );

      expect(result).toEqual(newSnapshot);
      expect(
        snapshotService.createSnapshot,
      ).toHaveBeenCalledWith(
        createdMarkdownFileDTO,
      );
      expect(
        s3Service.saveSnapshot,
      ).toHaveBeenCalledWith(
        diffDTO,
        nextSnapshotIndex,
      );
      expect(
        snapshotService.getSnapshotByID,
      ).toHaveBeenCalledWith('test');
    });
  });
});
