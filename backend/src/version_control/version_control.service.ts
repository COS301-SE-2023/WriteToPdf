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
    const nextDiffID =
      await this.markdownFileService.getNextDiffID(
        diffDTO.MarkdownID,
      );

    const nextDiff =
      await this.diffService.getDiff(
        diffDTO,
        nextDiffID,
      );

    await this.s3Service.saveDiff(
      diffDTO,
      nextDiffID,
    );

    if (
      nextDiffID !== 0 ||
      nextDiff.HasBeenUsed
    ) {
      if (
        (nextDiffID + 1) %
          parseInt(
            process.env.DIFFS_PER_SNAPSHOT,
          ) ===
        0
      ) {
        await this.saveSnapshot(diffDTO);

        const nextSnapshotID =
          await this.snapshotService.getNextSnapshotID(
            diffDTO.MarkdownID,
          );

        const nextSnapshot =
          await this.snapshotService.resetSnapshot(
            diffDTO.MarkdownID,
            nextSnapshotID,
          );

        await this.diffService.resetDiffs(
          diffDTO.MarkdownID,
          nextSnapshot.SnapshotID,
        );
      }
    }

    await this.diffService.updateDiff(
      diffDTO,
      nextDiffID,
    );

    await this.markdownFileService.incrementNextDiffID(
      diffDTO.MarkdownID,
    );
  }

  ///===-----------------------------------------------------

  // getDiff(diffDTO: DiffDTO) {}

  ///===-----------------------------------------------------

  // getAllDiffsForSnapshot(
  //   snapshotDTO: SnapshotDTO,
  // ) {}

  ///===-----------------------------------------------------

  async saveSnapshot(diffDTO: DiffDTO) {
    const nextSnapshotID =
      await this.markdownFileService.getNextSnapshotID(
        diffDTO.MarkdownID,
      );

    await this.s3Service.saveSnapshot(
      diffDTO,
      nextSnapshotID,
    );

    await this.snapshotService.updateSnapshot(
      diffDTO.MarkdownID,
      nextSnapshotID,
    );

    await this.markdownFileService.incrementNextSnapshotID(
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
      snapshotDTO.S3SnapshotID =
        snapshot.S3SnapshotID;
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
      diffDTO.S3DiffID = diff.S3DiffID;
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
      (diff) => diff.S3DiffID,
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
        snapshot.S3SnapshotID,
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
}
