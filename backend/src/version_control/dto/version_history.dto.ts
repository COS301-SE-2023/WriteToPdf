import { DiffDTO } from '../../diffs/dto/diffs.dto';
import { SnapshotDTO } from '../../snapshots/dto/snapshot.dto';

export class VersionHistoryDTO {
  DiffHistory: DiffDTO[];
  SnapshotHistory: SnapshotDTO[];
  RestorationDiffIndex: number;
  RestorationContent: string;

  constructor() {
    this.DiffHistory = undefined;
    this.SnapshotHistory = undefined;
    this.RestorationDiffIndex = undefined;
    this.RestorationContent = undefined;
  }
}