import { Injectable } from '@nestjs/common';
import { DiffsService } from 'src/diffs/diffs.service';
import { DiffDTO } from 'src/diffs/dto/diffs.dto';
import { S3ServiceMock } from 'src/s3/__mocks__/s3.service';
import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class VersionControlService {
  constructor(
    private diffService: DiffsService,
    private s3service: S3Service,
    private s3ServiceMock: S3ServiceMock,
  ) {}

  ///===-----------------------------------------------------

  saveDiff(diffDTO: DiffDTO) {
    // get nextDiffID
    // calls s3Service.saveDiff()
    // check if snapshot needs to be created
    // update diff metadata in table
  }

  ///===-----------------------------------------------------

  getDiff(diffDTO: DiffDTO) {}

  ///===-----------------------------------------------------

  getAllDiffs() {}

  ///===-----------------------------------------------------

  saveSnapshot() {}

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
