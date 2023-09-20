import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snapshot } from './entities/snapshots.entity';
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import * as CryptoJS from 'crypto-js';
import { SnapshotDTO } from './dto/snapshot.dto';

@Injectable()
export class SnapshotService {
  constructor(
    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
  ) {}

  ///===-----------------------------------------------------

  async createSnapshots(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const snapshotIDs = [];
    const snapshotRecords = [];
    for (
      let i = 0;
      i < parseInt(process.env.MAX_SNAPSHOTS) + 1;
      i++
    ) {
      const snapshotID = CryptoJS.SHA256(
        markdownFileDTO.UserID.toString() +
          new Date().getTime().toString() +
          i.toString(),
      ).toString();

      snapshotRecords.push({
        SnapshotID: snapshotID,
        MarkdownID: markdownFileDTO.MarkdownID,
        UserID: markdownFileDTO.UserID,
        S3SnapshotID: i,
        HasBeenUsed: false,
      });

      snapshotIDs.push(snapshotID);
    }
    await this.snapshotRepository.insert(
      snapshotRecords,
    );

    return snapshotIDs;
  }

  ///===-----------------------------------------------------

  async updateSnapshot(
    markdownID: string,
    nextSnapshotID: number,
  ) {
    const snapshot =
      await this.snapshotRepository.findOne({
        where: {
          MarkdownID: markdownID,
          S3SnapshotID: nextSnapshotID,
        },
      });

    snapshot.LastModified = new Date();
    snapshot.HasBeenUsed = true;
    await this.snapshotRepository.save(snapshot);
  }

  ///===-----------------------------------------------------

  async getAllSnapshots(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    return await this.snapshotRepository.find({
      where: {
        MarkdownID: markdownFileDTO.MarkdownID,
        HasBeenUsed: true,
      },
    });
  }

  ///===-----------------------------------------------------

  async deleteSnapshots(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    await this.snapshotRepository.delete({
      MarkdownID: markdownFileDTO.MarkdownID,
      HasBeenUsed: true,
    });
  }

  ///===-----------------------------------------------------

  getLogicalIndex(
    s3Index: number,
    nextSnapshotID: number,
    arr_len: number,
  ): number {
    return (
      (s3Index - nextSnapshotID + arr_len) %
      arr_len
    );
  }

  ///===-----------------------------------------------------

  async getLogicalSnapshotOrder(
    snapshotDTOs: SnapshotDTO[],
    nextDiffID: number,
  ) {
    const arrLength = parseInt(
      process.env.MAX_DIFFS,
    );
    const logicalOrder: SnapshotDTO[] = new Array(
      arrLength,
    ).fill(0);
    for (let idx = 0; idx < arrLength; idx++) {
      const logicalIndex = this.getLogicalIndex(
        snapshotDTOs[idx].S3SnapshotID,
        nextDiffID,
        arrLength,
      );
      logicalOrder[logicalIndex] =
        snapshotDTOs[idx];
    }
    return logicalOrder;
  }

  ///===-----------------------------------------------------

  async getSnapshotByID(snapshotID: string) {
    return await this.snapshotRepository.findOne({
      where: {
        SnapshotID: snapshotID,
      },
    });
  }
}
