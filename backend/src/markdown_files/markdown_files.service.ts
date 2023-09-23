import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import 'dotenv/config';
import { MarkdownFileDTO } from './dto/markdown_file.dto';
import { MarkdownFile } from './entities/markdown_file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MarkdownFilesService {
  constructor(
    @InjectRepository(MarkdownFile)
    private markdownFileRepository: Repository<MarkdownFile>,
  ) {}

  ///===----------------------------------------------------

  create(
    createMarkdownFileDTO: MarkdownFileDTO,
  ): Promise<MarkdownFileDTO> {
    const newMarkdownFile =
      this.markdownFileRepository.save(
        createMarkdownFileDTO,
      );
    return newMarkdownFile;
  }

  ///===----------------------------------------------------

  async updateName(
    updateMarkdownFileDTO: MarkdownFileDTO,
  ): Promise<any> {
    const markdownFile =
      await this.markdownFileRepository.findOne({
        where: {
          MarkdownID:
            updateMarkdownFileDTO.MarkdownID,
        },
      });
    markdownFile.Name =
      updateMarkdownFileDTO.Name;

    return this.markdownFileRepository.save(
      markdownFile,
    );
  }

  ///===----------------------------------------------------

  async updatePath(
    updateMarkdownFileDTO: MarkdownFileDTO,
  ): Promise<any> {
    const markdownFile =
      await this.markdownFileRepository.findOne({
        where: {
          MarkdownID:
            updateMarkdownFileDTO.MarkdownID,
        },
      });
    markdownFile.Path =
      updateMarkdownFileDTO.Path;

    markdownFile.ParentFolderID =
      updateMarkdownFileDTO.ParentFolderID;

    return this.markdownFileRepository.save(
      markdownFile,
    );
  }

  ///===----------------------------------------------------

  remove(
    removeMarkdownFileDTO: MarkdownFileDTO,
  ): Promise<any> {
    return this.markdownFileRepository.delete({
      MarkdownID:
        removeMarkdownFileDTO.MarkdownID,
    });
  }

  ///===----------------------------------------------------

  findAllByUserID(userID: number) {
    return this.markdownFileRepository.find({
      where: { UserID: userID },
    });
  }

  ///===----------------------------------------------------

  async updateAfterModification(
    markdownDTO: MarkdownFileDTO,
  ) {
    const markdownToUpdate =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownDTO.MarkdownID,
        },
      );
    markdownToUpdate.LastModified = new Date();
    markdownToUpdate.Size = markdownDTO.Size;
    return this.markdownFileRepository.save(
      markdownToUpdate,
    );
  }

  ///===----------------------------------------------------

  async updateSafeLockStatus(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const markdownToUpdate =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownFileDTO.MarkdownID,
        },
      );

    if (!markdownToUpdate) {
      throw new HttpException(
        'Markdown file not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    markdownToUpdate.SafeLock =
      markdownFileDTO.SafeLock;
    return this.markdownFileRepository.save(
      markdownToUpdate,
    );
  }

  ///===----------------------------------------------------

  async getNextDiffID(markdownID: string) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    return markdownFile.NextDiffIndex;
  }

  ///===----------------------------------------------------

  async getNextSnapshotID(markdownID: string) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    return markdownFile.NextSnapshotIndex;
  }

  ///===----------------------------------------------------

  async incrementNextDiffID(markdownID: string) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    markdownFile.NextDiffIndex =
      (markdownFile.NextDiffIndex + 1) %
      parseInt(process.env.MAX_DIFFS);
    return await this.markdownFileRepository.save(
      markdownFile,
    );
  }

  ///===----------------------------------------------------

  async incrementNextSnapshotID(
    markdownID: string,
  ) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    markdownFile.NextSnapshotIndex =
      (markdownFile.NextSnapshotIndex + 1) %
      parseInt(process.env.MAX_SNAPSHOTS);
    return this.markdownFileRepository.save(
      markdownFile,
    );
  }

  ///===----------------------------------------------------

  async getTotalNumDiffs(markdownID: string) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    return markdownFile.TotalNumDiffs;
  }

  ///===----------------------------------------------------

  async getTotalNumSnapshots(markdownID: string) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    return markdownFile.TotalNumSnapshots;
  }

  ///===----------------------------------------------------

  async incrementTotalNumDiffs(
    markdownID: string,
  ) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    markdownFile.TotalNumDiffs++;
    return this.markdownFileRepository.save(
      markdownFile,
    );
  }

  ///===----------------------------------------------------

  async incrementTotalNumSnapshots(
    markdownID: string,
  ) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    markdownFile.TotalNumSnapshots++;
    return this.markdownFileRepository.save(
      markdownFile,
    );
  }

  ///===----------------------------------------------------

  async getSaveDiffInfo(markdownID: string) {
    const markdownFile =
      await this.markdownFileRepository.findOneBy(
        {
          MarkdownID: markdownID,
        },
      );
    return {
      nextDiffIndex: markdownFile.NextDiffIndex,
      nextSnapshotIndex:
        markdownFile.NextSnapshotIndex,
      totalNumDiffs: markdownFile.TotalNumDiffs,
      totalNumSnapshots:
        markdownFile.TotalNumSnapshots,
    };
  }
}
