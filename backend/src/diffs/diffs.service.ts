import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    nextDiffID: number,
  ) {
    const diff =
      await this.diffRepository.findOne({
        where: {
          MarkdownID: diffDTO.MarkdownID,
          S3DiffID: nextDiffID,
        },
      });

    return diff;
  }

  ///===-----------------------------------------------------

  async updateDiff(
    diffDTO: DiffDTO,
    nextDiffID: number,
  ) {
    // const diff =
    //   await this.diffRepository.findOne({
    //     where: {
    //       MarkdownID: diffDTO.MarkdownID,
    //       S3DiffID: nextDiffID,
    //     },
    //   });

    const diff = await this.getDiff(
      diffDTO,
      nextDiffID,
    );

    diff.LastModified = new Date();
    diff.HasBeenUsed = true;
    await this.diffRepository.save(diff);
  }

  ///===-----------------------------------------------------

  async createDiffs(
    markdownFileDTO: MarkdownFileDTO,
    snapshotIDs: string[],
  ) {
    const diffRecords = [];
    let snapshotIndex = 0;
    for (
      let i = 0;
      i < parseInt(process.env.MAX_DIFFS);
      i++
    ) {
      const diffID = CryptoJS.SHA256(
        markdownFileDTO.UserID.toString() +
          new Date().getTime().toString() +
          i.toString(),
      ).toString();

      if (
        i %
          parseInt(
            process.env.DIFFS_PER_SNAPSHOT,
          ) ===
          0 &&
        i !== 0
      ) {
        snapshotIndex++;
      }

      diffRecords.push({
        DiffID: diffID,
        MarkdownID: markdownFileDTO.MarkdownID,
        UserID: markdownFileDTO.UserID,
        S3DiffID: i,
        HasBeenUsed: false,
        SnapshotID: snapshotIDs[snapshotIndex],
      });
    }
    await this.diffRepository.insert(diffRecords);
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

  async getAllDiffs(
    markdownID: string,
  ) {
    return await this.diffRepository.find({
      where: {
        MarkdownID: markdownID,
        HasBeenUsed: true,
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
        diffDTOs[idx].S3DiffID,
        nextDiffID,
        arrLength,
      );
      logicalOrder[logicalIndex] = diffDTOs[idx];
    }
    return logicalOrder;
  }
}
