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

  async createSnapshot(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const snapshotID = CryptoJS.SHA256(
      markdownFileDTO.UserID.toString() +
        new Date().getTime().toString(),
    ).toString();

    await this.snapshotRepository.insert({
      SnapshotID: snapshotID,
      MarkdownID: markdownFileDTO.MarkdownID,
      UserID: markdownFileDTO.UserID,
      S3SnapshotIndex:
        markdownFileDTO.NextSnapshotIndex,
      HasBeenUsed: false,
    });

    return snapshotID;
  }

  async createSnapshots(
    markdownFileDTO: MarkdownFileDTO,
  ) {
    const snapshotIDs = [];
    const snapshotRecords = [];
    for (
      let i = 0;
      i < parseInt(process.env.MAX_SNAPSHOTS);
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
        S3SnapshotIndex:
          markdownFileDTO.NextSnapshotIndex,
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
    nextSnapshotIndex: number,
  ) {
    const snapshot =
      await this.snapshotRepository.findOne({
        where: {
          MarkdownID: markdownID,
          S3SnapshotIndex: nextSnapshotIndex,
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

  async resetSnapshot(
    markdownID: string,
    nextSnapshotIndex: number,
  ) {
    const snapshot =
      await this.snapshotRepository.findOne({
        where: {
          MarkdownID: markdownID,
          S3SnapshotIndex: nextSnapshotIndex,
        },
      });

    snapshot.HasBeenUsed = false;
    await this.snapshotRepository.save(snapshot);
    return snapshot;
  }

  ///===-----------------------------------------------------

  async getSnapshot(
    markdownID: string,
    s3SnapshotIndex: number,
  ) {
    return await this.snapshotRepository.findOne({
      where: {
        MarkdownID: markdownID,
        S3SnapshotIndex: s3SnapshotIndex,
      },
    });
  }

  // ///===-----------------------------------------------------

  // async getNextSnapshotID(markdownID: string) {
  //   const markdownFile =
  //     await this.snapshotRepository.findOne({
  //       where: {
  //         MarkdownID: markdownID,
  //       },
  //     });
  //   return markdownFile.S3SnapshotID;
  // }

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
    console.log(
      'snapshots.service snapshotDTOS: ',
      snapshotDTOs,
    );
    const arrLength = parseInt(
      process.env.MAX_DIFFS,
    );
    const logicalOrder: SnapshotDTO[] = new Array(
      arrLength,
    ).fill(0);
    for (let idx = 0; idx < arrLength; idx++) {
      const logicalIndex = this.getLogicalIndex(
        snapshotDTOs[idx].S3SnapshotIndex,
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
