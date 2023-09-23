import { Injectable } from '@nestjs/common';
import { DiffsService } from '../diffs/diffs.service';
import { DiffDTO } from '../diffs/dto/diffs.dto';
import { MarkdownFilesService } from '../markdown_files/markdown_files.service';
import { S3ServiceMock } from '../s3/__mocks__/s3.service';
import { S3Service } from '../s3/s3.service';
import { SnapshotDTO } from '../snapshots/dto/snapshot.dto';
import { SnapshotService } from '../snapshots/snapshots.service';
import { Snapshot } from '../snapshots/entities/snapshots.entity';
import { Diff } from '../diffs/entities/diffs.entity';
import { VersionHistoryDTO } from './dto/version_history.dto';
import { VersionSetDTO } from './dto/version_set.dto';
import { MarkdownFileDTO } from 'src/markdown_files/dto/markdown_file.dto';

@Injectable()
export class VersionControlService {
  constructor(
    private diffService: DiffsService,
    private snapshotService: SnapshotService,
    private markdownFileService: MarkdownFilesService,
    private s3Service: S3Service,
    private s3ServiceMock: S3ServiceMock,
  ) {}

  ///===-----------------------------------------------------

  async saveDiff(diffDTO: DiffDTO) {
    console.log(
      '///===------------------version_control.saveDiff',
    );
    // 1. Get necessary info for saving a diff
    const saveDiffInfoDTO =
      await this.markdownFileService.getSaveDiffInfo(
        diffDTO.MarkdownID,
      );

    console.log(
      'saveDiff.saveDiffInfoDTO:',
      saveDiffInfoDTO,
    );

    // 2. Get next diff
    let nextDiff = await this.diffService.getDiff(
      diffDTO,
      saveDiffInfoDTO.nextDiffIndex,
    );
    console.log('saveDiff.nextDiff:', nextDiff);

    // 3. Get next snapshot
    let nextSnapshot =
      await this.snapshotService.getSnapshot(
        diffDTO.MarkdownID,
        saveDiffInfoDTO.nextSnapshotIndex,
      );
    console.log(
      'saveDiff.nextSnapshot:',
      nextSnapshot,
    );

    ///===----------------------------------------------------
    // 4. Create DB and S3 references if they do not yet exist
    // 5. Create diff references if nextDiff does not exist
    if (nextDiff === null) {
      console.log(
        'saveDiff.nextDiff is null:',
        nextDiff,
      );
      await this.createDiff(
        diffDTO,
        saveDiffInfoDTO.nextDiffIndex,
      );

      nextDiff = await this.diffService.getDiff(
        diffDTO,
        saveDiffInfoDTO.nextDiffIndex,
      );
      console.log(
        'saveDiff.nextDiff references should have been created:',
        nextDiff,
      );
    }

    // 6. Create snapshot references if nextSnapshot does not exist
    if (nextSnapshot === null) {
      console.log(
        'saveDiff.nextSnapshot is null:',
        nextSnapshot,
      );
      nextSnapshot = await this.createSnapshot(
        diffDTO,
        saveDiffInfoDTO.nextSnapshotIndex,
      );
      console.log(
        'saveDiff.nextSnapshot references should have been created:',
        nextSnapshot,
      );
    }
    ///===----------------------------------------------------
    // Save diff content to S3 and increment nextIndex and TotalNumDiffs
    await this.saveDiffContent(
      diffDTO,
      saveDiffInfoDTO.nextDiffIndex,
      nextSnapshot.SnapshotID,
    );

    // Check if new snapshot must be populated
    if (
      (saveDiffInfoDTO.nextDiffIndex + 1) %
        parseInt(
          process.env.DIFFS_PER_SNAPSHOT,
        ) ===
      0
    ) {
      // Populate snapshot in DB and S3
      await this.saveSnapshot(
        diffDTO,
        saveDiffInfoDTO.nextSnapshotIndex,
      );
    }
  }

  ///===-----------------------------------------------------

  async saveSnapshot(
    diffDTO: DiffDTO,
    nextSnapshotIndex: number,
  ) {
    await this.s3Service.saveSnapshot(
      diffDTO,
      nextSnapshotIndex,
    );

    await this.snapshotService.updateSnapshot(
      diffDTO.MarkdownID,
      nextSnapshotIndex,
    );

    await this.markdownFileService.incrementNextSnapshotIndex(
      diffDTO.MarkdownID,
    );
  }

  async saveDiffContent(
    diffDTO: DiffDTO,
    nextDiffIndex: number,
    SnapshotID: string,
  ) {
    await this.diffService.updateDiff(
      diffDTO,
      nextDiffIndex,
      SnapshotID,
    );

    await this.s3Service.saveDiff(
      diffDTO,
      nextDiffIndex,
    );

    await this.markdownFileService.incrementNextDiffIndex(
      diffDTO.MarkdownID,
    );

    await this.markdownFileService.incrementTotalNumDiffs(
      diffDTO.MarkdownID,
    );
  }

  ///===-----------------------------------------------------

  // getDiffSetForSnapshot(snapshot: SnapshotDTO) {}

  ///===-----------------------------------------------------

  /**
   * @dev frontend calls retrieveOne for file opened by user
   * @dev frontend needs to render all snapshots for the file
   *      as dropdown options
   *
   * @returns all snapshots for this file, in logical order
   */
  async getAllSnapshots(
    snapshotDTO: SnapshotDTO,
  ) {
    const snapshotRange = Array.from(
      {
        length: parseInt(
          process.env.MAX_SNAPSHOTS,
        ),
      },
      (_, index) => index,
    );

    const nextSnapshotID =
      await this.markdownFileService.getNextSnapshotID(
        snapshotDTO.MarkdownID,
      );

    const logicalOrder = this.getLogicalOrder(
      snapshotRange,
      nextSnapshotID,
    );

    let snapshots =
      await this.s3Service.retrieveAllSnapshots(
        logicalOrder,
        snapshotDTO,
      );

    snapshots =
      this.pruneEmptySnapshots(snapshots);

    return snapshots;
  }

  ///===----------------------------------------------------
  // Helpers

  getDiffSetIndices(snapshotID: number) {
    const diffsPerSnap = parseInt(
      process.env.DIFFS_PER_SNAPSHOT,
    );
    const first = snapshotID * diffsPerSnap;
    const last = first + diffsPerSnap;
    const indices = Array.from(
      { length: last - first },
      (_, index) => index + first,
    );
    return indices;
  }

  ///===----------------------------------------------------

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

  ///===-----------------------------------------------------

  pruneEmptySnapshots(snapshots: SnapshotDTO[]) {
    return snapshots.filter((snapshot) => {
      return (
        snapshot.Content !== undefined &&
        snapshot.Content !== null &&
        snapshot.Content !== ''
      );
    });
  }

  ///===----------------------------------------------------

  async convertSnapshotsToSnapshotDTOs(
    snapshots: Snapshot[],
  ) {
    const snapshotDTOs = [];
    for (let i = 0; i < snapshots.length; i++) {
      const snapshot = snapshots[i];
      const snapshotDTO = new SnapshotDTO();
      snapshotDTO.SnapshotID =
        snapshot.SnapshotID;
      snapshotDTO.MarkdownID =
        snapshot.MarkdownID;
      snapshotDTO.UserID = snapshot.UserID;
      snapshotDTO.S3SnapshotIndex =
        snapshot.S3SnapshotIndex;
      snapshotDTO.LastModified =
        snapshot.LastModified;
      snapshotDTOs.push(snapshotDTO);
    }
    return snapshotDTOs;
  }

  ///===----------------------------------------------------

  async convertDiffsToDiffDTOs(diffs: Diff[]) {
    const diffDTOs: DiffDTO[] = [];
    for (let i = 0; i < diffs.length; i++) {
      const diff = diffs[i];
      const diffDTO = new DiffDTO();
      diffDTO.DiffID = diff.DiffID;
      diffDTO.MarkdownID = diff.MarkdownID;
      diffDTO.UserID = diff.UserID;
      diffDTO.S3DiffIndex = diff.S3DiffIndex;
      diffDTO.LastModified = diff.LastModified;
      diffDTO.SnapshotID = diff.SnapshotID;
      diffDTOs.push(diffDTO);
    }
    return diffDTOs;
  }

  ///===----------------------------------------------------

  async getHistorySet(
    versionSetDTO: VersionSetDTO,
  ) {
    const diffs =
      await this.diffService.getAllDiffs(
        versionSetDTO.MarkdownID,
      );

    const S3DiffIDs: number[] = diffs.map(
      (diff) => diff.S3DiffIndex,
    );

    const diffDTOs =
      await this.s3Service.getDiffSet(
        S3DiffIDs,
        versionSetDTO.UserID,
        versionSetDTO.MarkdownID,
      );

    const snapshot =
      await this.snapshotService.getSnapshotByID(
        versionSetDTO.SnapshotID,
      );

    const snapshotDTO =
      await this.s3Service.getSnapshot(
        snapshot.S3SnapshotIndex,
        versionSetDTO.UserID,
        versionSetDTO.MarkdownID,
      );

    const versionHistoryDTO =
      new VersionHistoryDTO();

    versionHistoryDTO.DiffHistory = diffDTOs;
    versionHistoryDTO.SnapshotHistory = [
      snapshotDTO,
    ];
    return versionHistoryDTO;
  }

  ///===----------------------------------------------------

  async createDiff(
    diffDTO: DiffDTO,
    nextDiffIndex: number,
  ) {
    const markdownFileDTO = new MarkdownFileDTO();
    markdownFileDTO.MarkdownID =
      diffDTO.MarkdownID;
    markdownFileDTO.UserID = diffDTO.UserID;
    markdownFileDTO.NextDiffIndex = nextDiffIndex;

    // Create diff in s3 and save content
    await this.s3Service.saveDiff(
      diffDTO,
      nextDiffIndex,
    );

    // Create diff in db
    return await this.diffService.createDiffWithoutSnapshotID(
      markdownFileDTO,
    );
  }

  ///===----------------------------------------------------

  async createSnapshot(
    diffDTO: DiffDTO,
    nextSnapshotIndex: number,
  ) {
    const markdownFileDTO = new MarkdownFileDTO();
    markdownFileDTO.MarkdownID =
      diffDTO.MarkdownID;
    markdownFileDTO.UserID = diffDTO.UserID;
    markdownFileDTO.NextSnapshotIndex =
      nextSnapshotIndex;

    // Create snapshot in s3 and save content
    await this.s3Service.saveSnapshot(
      diffDTO,
      nextSnapshotIndex,
    );

    // // Increment num snapshots
    // await this.markdownFileService.incrementTotalNumSnapshots(
    //   markdownFileDTO.MarkdownID,
    // );

    // Create snapshot in db
    const snapshotID =
      await this.snapshotService.createSnapshot(
        markdownFileDTO,
      );

    return await this.snapshotService.getSnapshotByID(
      snapshotID,
    );
  }
}
