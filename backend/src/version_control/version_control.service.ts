import { Injectable } from '@nestjs/common';
import { DiffDTO } from './dto/diff.dto';

@Injectable()
export class VersionControlService {
  saveDiff(diffDTO: DiffDTO) {}

  getDiff(diffDTO: DiffDTO) {}

  getAllDiffs() {}

  //==-----------------------------------------------------

  saveSnapshot() {}

  getSnapshot() {}

  getAllSnapshots() {}

  ///===----------------------------------------------------
  // Helpers

  getLogicalIndex(
    idx: number,
    head: number,
    arr_len: number,
  ): number {
    return (idx - head + arr_len) % arr_len;
  }

  reorderArray(
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
