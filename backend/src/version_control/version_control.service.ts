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
import { MarkdownFileDTO } from '../markdown_files/dto/markdown_file.dto';
import { version } from 'os';
import { VersionRollbackDTO } from './dto/version_rollback.dto';

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
    // 1. Get necessary info for saving a diff
    const saveDiffInfoDTO =
      await this.markdownFileService.getSaveDiffInfo(
        diffDTO.MarkdownID,
      );

    // 2. Get next diff
    let nextDiff = await this.diffService.getDiff(
      diffDTO,
      saveDiffInfoDTO.nextDiffIndex,
    );

    // 3. Get next snapshot
    let nextSnapshot =
      await this.snapshotService.getSnapshot(
        diffDTO.MarkdownID,
        saveDiffInfoDTO.nextSnapshotIndex,
      );

    console.log(
      'nextDiffIndex: ',
      saveDiffInfoDTO.nextDiffIndex,
    );

    if (
      saveDiffInfoDTO.totalNumDiffs >=
        parseInt(process.env.MAX_DIFFS) &&
      saveDiffInfoDTO.nextDiffIndex %
        parseInt(
          process.env.DIFFS_PER_SNAPSHOT,
        ) ===
        0
    ) {
      console.log('resetting trailing diffs');
      await this.diffService.resetTrailingDiffs(
        saveDiffInfoDTO.nextDiffIndex,
        diffDTO.MarkdownID,
      );
    }

    ///===----------------------------------------------------
    // 4. Create DB and S3 references if they do not yet exist
    // 5. Create diff references if nextDiff does not exist
    if (nextDiff === null) {
      await this.createDiff(
        diffDTO,
        saveDiffInfoDTO.nextDiffIndex,
      );

      nextDiff = await this.diffService.getDiff(
        diffDTO,
        saveDiffInfoDTO.nextDiffIndex,
      );
    }

    // 6. Create snapshot references if nextSnapshot does not exist
    if (nextSnapshot === null) {
      nextSnapshot = await this.createSnapshot(
        diffDTO,
        saveDiffInfoDTO.nextSnapshotIndex,
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
        saveDiffInfoDTO.totalNumDiffs,
      );
    }
  }

  ///===-----------------------------------------------------

  async saveSnapshot(
    diffDTO: DiffDTO,
    nextSnapshotIndex: number,
    totalNumDiffs: number,
  ) {
    // Backup if not in first pass
    if (
      totalNumDiffs >=
      parseInt(process.env.MAX_DIFFS)
    )
      await this.s3Service.backupSnapshot(
        diffDTO,
        nextSnapshotIndex,
      );
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
      await this.markdownFileService.getNextSnapshotIndex(
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
    const S3DiffIndices: number[] =
      versionSetDTO.DiffHistory.map(
        (diff) => diff.S3DiffIndex,
      );

    const diffDTOs =
      await this.s3Service.getDiffSet(
        S3DiffIndices,
        versionSetDTO.UserID,
        versionSetDTO.MarkdownID,
      );

    const prevSnapshot =
      await this.getPreviousSnapshot(
        versionSetDTO,
      );

    const versionHistoryDTO =
      new VersionHistoryDTO();

    versionHistoryDTO.DiffHistory = diffDTOs;
    versionHistoryDTO.SnapshotHistory = [
      prevSnapshot,
    ];
    return versionHistoryDTO;
  }

  ///===----------------------------------------------------

  async getPreviousSnapshot(
    versionSetDTO: VersionSetDTO,
  ) {
    if (versionSetDTO.IsHeadSnapshot) {
      return await this.s3Service.getSnapshot(
        -1,
        versionSetDTO.UserID,
        versionSetDTO.MarkdownID,
      );
    }

    const snapshot =
      await this.snapshotService.getSnapshotByID(
        versionSetDTO.SnapshotID,
      );

    if (versionSetDTO.IsLatestSnapshot) {
      return await this.s3Service.getSnapshot(
        snapshot.S3SnapshotIndex,
        versionSetDTO.UserID,
        versionSetDTO.MarkdownID,
      );
    }

    let prevSnapshotIndex;
    if (snapshot.S3SnapshotIndex === 0) {
      prevSnapshotIndex =
        parseInt(process.env.MAX_SNAPSHOTS) - 1;
    } else {
      prevSnapshotIndex =
        snapshot.S3SnapshotIndex - 1;
    }

    console.log(
      'prevSnapshotIndex: ',
      prevSnapshotIndex,
    );

    return await this.s3Service.getSnapshot(
      prevSnapshotIndex,
      versionSetDTO.UserID,
      versionSetDTO.MarkdownID,
    );
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

  ///===----------------------------------------------------

  async getSnapshot(snapshotDTO: SnapshotDTO) {
    return await this.s3Service.getSnapshot(
      snapshotDTO.S3SnapshotIndex,
      snapshotDTO.UserID,
      snapshotDTO.MarkdownID,
    );
  }

  ///===----------------------------------------------------

  async rollbackVersion(
    versionRollbackDTO: VersionRollbackDTO,
  ) {
    const restoredVersionDTO =
      await this.buildRestoreVersionDTO(
        versionRollbackDTO,
      );

    await this.s3Service.saveFile(
      restoredVersionDTO,
    );

    const diffIndicesToReset =
      this.getDiffIndicesToReset(
        restoredVersionDTO.NextDiffIndex,
        versionRollbackDTO.DiffIndex,
      );

    console.log(
      'diffIndicesToReset: ',
      diffIndicesToReset,
    );

    const snapshotIndices =
      await this.resetSubsequentSnapshots(
        versionRollbackDTO.MarkdownID,
        diffIndicesToReset,
      );

    console.log(
      'snapshotIndices: ',
      snapshotIndices,
    );

    await this.resetSubsequentDiffs(
      versionRollbackDTO.MarkdownID,
      diffIndicesToReset,
    );

    const newNextDiffIndex =
      versionRollbackDTO.DiffIndex +
      (1 % parseInt(process.env.MAX_DIFFS));

    console.log(
      'newNextDiffIndex: ',
      newNextDiffIndex,
    );

    await this.markdownFileService.updateMetadataAfterRestore(
      versionRollbackDTO.MarkdownID,
      newNextDiffIndex,
      snapshotIndices[0],
    );

    return 0;
  }

  ///===----------------------------------------------------

  async resetSubsequentDiffs(
    markdownID: string,
    diffIndicesToReset: number[],
  ) {
    await this.diffService.updateDiffsAfterRestore(
      markdownID,
      diffIndicesToReset,
    );
  }

  ///===----------------------------------------------------

  async resetSubsequentSnapshots(
    markdownID: string,
    diffIndicesToReset: number[],
  ) {
    const snapshotIDsToReset =
      await this.diffService.getSnapshotsToReset(
        markdownID,
        diffIndicesToReset,
      );

    console.log(
      'Resetting the following snapshotIndices: ',
      snapshotIDsToReset,
    );

    const snapshotIndices =
      await this.snapshotService.resetSnapshot(
        markdownID,
        snapshotIDsToReset,
      );

    return snapshotIndices;
  }

  ///===----------------------------------------------------

  getDiffIndicesToReset(
    NextDiffIndex: number,
    RestorationDiffIndex: number,
  ) {
    const arr = [];
    RestorationDiffIndex++;
    const MAX_DIFFS = parseInt(
      process.env.MAX_DIFFS,
    );
    for (let i = 0; i < MAX_DIFFS; i++) {
      if (
        RestorationDiffIndex % MAX_DIFFS ===
        NextDiffIndex
      ) {
        break;
      }
      arr.push(RestorationDiffIndex);
      RestorationDiffIndex++;
    }
    return arr;
  }

  ///===----------------------------------------------------

  async buildRestoreVersionDTO(
    versionRollbackDTO: VersionRollbackDTO,
  ) {
    const nextDiffIndex =
      await this.markdownFileService.getNextDiffIndex(
        versionRollbackDTO.MarkdownID,
      );

    const nextSnapshotIndex =
      await this.markdownFileService.getNextSnapshotIndex(
        versionRollbackDTO.MarkdownID,
      );
    const restoredVersionDTO =
      new MarkdownFileDTO();
    restoredVersionDTO.MarkdownID =
      versionRollbackDTO.MarkdownID;
    restoredVersionDTO.UserID =
      versionRollbackDTO.UserID;
    restoredVersionDTO.Content =
      versionRollbackDTO.Content;
    restoredVersionDTO.NextDiffIndex =
      nextDiffIndex;
    restoredVersionDTO.NextSnapshotIndex =
      nextSnapshotIndex;
    return restoredVersionDTO;
  }

  ///===----------------------------------------------------
}
