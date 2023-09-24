import { DiffDTO } from '../../diffs/dto/diffs.dto';
import { SnapshotDTO } from '../../snapshots/dto/snapshot.dto';

export class VersionSetDTO {
  UserID: number;
  MarkdownID: string;
  DiffHistory: DiffDTO[];
  SnapshotID: string;
  IsHeadSnapshot: boolean;
  IsLatestSnapshot: boolean;

  constructor() {
    this.UserID = undefined;
    this.MarkdownID = undefined;
    this.DiffHistory = undefined;
    this.SnapshotID = undefined;
    this.IsHeadSnapshot = undefined;
    this.IsLatestSnapshot = undefined;
  }
}
