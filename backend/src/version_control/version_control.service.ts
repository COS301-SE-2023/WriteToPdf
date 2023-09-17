import { Injectable } from '@nestjs/common';
import { DiffsService } from '../diffs/diffs.service';
import { DiffDTO } from '../diffs/dto/diffs.dto';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { S3Service } from '../s3/s3.service';
import { SnapshotDTO } from '../snapshots/dto/snapshot.dto';

@Injectable()
export class VersionControlService {
  constructor(
    private diffService: DiffsService,
    private markdownFileService: MarkdownFilesService,
    private s3Service: S3Service,
    private s3ServiceMock: S3ServiceMock,
  ) {}

  ///===-----------------------------------------------------

  async saveDiff(diffDTO: DiffDTO) {
    const nextDiffID =
      await this.markdownFileService.getNextDiffID(
        diffDTO.MarkdownID,
      );

    this.s3Service.saveDiff(diffDTO, nextDiffID);

    if (
      nextDiffID %
        parseInt(
          process.env.DIFFS_PER_SNAPSHOT,
        ) ===
        0 &&
      nextDiffID !== 0
    ) {
      // create snapshot
    }

    await this.diffService.updateDiff(nextDiffID);
    await this.markdownFileService.incrementNextDiffID(
      diffDTO.MarkdownID,
    );
  }

  ///===-----------------------------------------------------

  getDiff(diffDTO: DiffDTO) {}

  ///===-----------------------------------------------------

  getAllDiffsForSnapshot(
    snapshotDTO: SnapshotDTO,
  ) {}

  ///===-----------------------------------------------------

  async saveSnapshot(snapshotDTO: SnapshotDTO) {
    const nextSnapshotID =
      await this.markdownFileService.getNextSnapshotID(
        snapshotDTO.MarkdownID,
      );

    this.s3Service.saveSnapshot(
      snapshotDTO,
      nextSnapshotID,
    );

    await this.diffService.updateDiff(
      nextSnapshotID,
    );
    await this.markdownFileService.incrementNextDiffID(
      snapshotDTO.MarkdownID,
    );
  }

  ///===-----------------------------------------------------

  getSnapshot() {}

  ///===-----------------------------------------------------

  /**
   * @dev frontend calls retrieveOne for file opened by user
   * @dev frontend needs to render all snapshots for the file
   *      as dropdown options
   *
   * @returns all snapshots for this file, in logical order
   */
  getAllSnapshots() {
    // calls s3Service.getAllSnapshots()
    // reorders snapshots in logical order
    // return logically ordered snapshots
  }

  ///===----------------------------------------------------
  // Helpers

  getLogicalIndex(
    s3Index: number,
    head: number,
    arr_len: number,
  ): number {
    return (s3Index - head + arr_len) % arr_len;
  }

  ///===-----------------------------------------------------

  getIndexInS3(
    logicalIndex: number,
    arr_len: number,
    head: number,
  ) {
    return (
      (logicalIndex + head - arr_len) % arr_len
    );
  }

  ///===-----------------------------------------------------

  getLogicalOrder(
    arr: number[],
    head: number,
  ): number[] {
    const logicalOrder: number[] = new Array(
      arr.length,
    ).fill(0);
    for (let idx = 0; idx < arr.length; idx++) {
      const logicalIndex = this.getLogicalIndex(
        idx,
        head,
        arr.length,
      );
      logicalOrder[logicalIndex] = arr[idx];
    }
    return logicalOrder;
  }
}
