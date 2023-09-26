import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Diff } from './entities/diffs.entity';
import 'dotenv/config';
import * as CryptoJS from 'crypto-js';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { DiffDTO } from './dto/diffs.dto';

@Injectable()
export class DiffsService {
  constructor(
    @InjectRepository(Diff)
    private diffRepository: Repository<Diff>,
  ) {}

  ///===-----------------------------------------------------

  async getDiff(
    diffDTO: DiffDTO,
    nextDiffIndex: number,
  ) {
    const diff =
      await this.diffRepository.findOne({
        where: {
          MarkdownID: diffDTO.MarkdownID,
          S3DiffIndex: nextDiffIndex,
        },
      });

    return diff;
  }

  ///===-----------------------------------------------------

  async updateDiff(
    diffDTO: DiffDTO,
    nextDiffIndex: number,
    nextSnapshotID: string,
  ) {
    diffDTO.SnapshotID = nextSnapshotID;
    diffDTO.S3DiffIndex = nextDiffIndex;
    const diff = await this.getDiff(
      diffDTO,
      nextDiffIndex,
    );

    diff.LastModified = new Date();
    diff.HasBeenUsed = true;
    diff.SnapshotID = nextSnapshotID;
    return await this.diffRepository.save(diff);
  }

  ///===-----------------------------------------------------

  async createDiff(
    markdownFileDTO: MarkdownFileDTO,
    nextSnapshotID: string,
  ) {
    const diffID = CryptoJS.SHA256(
      markdownFileDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    await this.diffRepository.insert({
      DiffID: diffID,
      MarkdownID: markdownFileDTO.MarkdownID,
      UserID: markdownFileDTO.UserID,
      S3DiffIndex: markdownFileDTO.NextDiffIndex,
      HasBeenUsed: false,
      SnapshotID: nextSnapshotID,
    });
  }

  ///===-----------------------------------------------------

  async createDiffWithoutSnapshotID(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const diffID = CryptoJS.SHA256(
      markdownFileDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    return await this.diffRepository.insert({
      DiffID: diffID,
      MarkdownID: markdownFileDTO.MarkdownID,
      UserID: markdownFileDTO.UserID,
      S3DiffIndex: markdownFileDTO.NextDiffIndex,
      HasBeenUsed: false,
      SnapshotID: 'temp',
    });
  }

  ///===-----------------------------------------------------

  async deleteDiffs(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    await this.diffRepository.delete({
      MarkdownID: markdownFileDTO.MarkdownID,
    });
  }

  ///===-----------------------------------------------------

  async resetDiffs(
    markdownID: string,
    snapshotID: string,
  ) {
    await this.diffRepository.update(
      {
        MarkdownID: markdownID,
        SnapshotID: snapshotID,
      },
      {
        HasBeenUsed: false,
      },
    );
  }

  ///===-----------------------------------------------------

  async getAllDiffs(markdownID: string) {
    return await this.diffRepository.find({
      where: {
        MarkdownID: markdownID,
        HasBeenUsed: true,
      },
    });
  }

  ///===-----------------------------------------------------

  async getDiffSet(
    markdownID: string,
    DiffIDs: string[],
  ) {
    return await this.diffRepository.find({
      where: {
        MarkdownID: markdownID,
        DiffID: In(DiffIDs),
      },
    });
  }

  ///===-----------------------------------------------------

  getLogicalIndex(
    s3Index: number,
    nextDiffID: number,
    arr_len: number,
  ): number {
    return (
      (s3Index - nextDiffID + arr_len) % arr_len
    );
  }

  ///===-----------------------------------------------------

  async getLogicalDiffOrder(
    diffDTOs: DiffDTO[],
    nextDiffID: number,
  ) {
    const arrLength = parseInt(
      process.env.MAX_DIFFS,
    );
    const logicalOrder: DiffDTO[] = new Array(
      arrLength,
    ).fill(0);
    for (let idx = 0; idx < arrLength; idx++) {
      const logicalIndex = this.getLogicalIndex(
        diffDTOs[idx].S3DiffIndex,
        nextDiffID,
        arrLength,
      );
      logicalOrder[logicalIndex] = diffDTOs[idx];
    }
    return logicalOrder;
  }

  ///===-----------------------------------------------------

  async getSnapshotsToReset(
    markdownID: string,
    diffIndicesToReset: number[],
  ) {
    const snapshotIDs = [];
    for (
      let idx = 0;
      idx < diffIndicesToReset.length;
      idx++
    ) {
      const diff =
        await this.diffRepository.findOne({
          where: {
            MarkdownID: markdownID,
            S3DiffIndex: diffIndicesToReset[idx],
          },
        });
      snapshotIDs.push(diff.SnapshotID);
    }
    console.log(
      'snapshotIDs to reset: ',
      snapshotIDs,
    );
    return snapshotIDs;
  }

  ///===-----------------------------------------------------

  async updateDiffsAfterRestore(
    markdownID: string,
    diffDTOs: number[],
  ) {
    await this.diffRepository.update(
      {
        MarkdownID: markdownID,
        S3DiffIndex: In(diffDTOs),
      },
      {
        HasBeenUsed: false,
      },
    );
  }
}
