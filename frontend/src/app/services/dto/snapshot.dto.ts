import { DiffDTO } from './diff.dto';

export class SnapshotDTO {
  SnapshotID: string;
  UserID: number;
  MarkdownID: string;
  SnapshotNumber: number;
  Content: string;
  OldestSnapshot: boolean;
  LastModified: Date;
  LastModifiedString: string;
  Name: string;
  ChildDiffs: DiffDTO[];
  OrderNumber: number;

  constructor() {
    this.SnapshotID = '';
    this.UserID = 0;
    this.MarkdownID = '';
    this.SnapshotNumber = 0;
    this.Content = '';
    this.OldestSnapshot = false;
    this.LastModified = new Date();
    this.LastModifiedString = '';
    this.Name = '';
    this.ChildDiffs = [];
    this.OrderNumber = 0;
  }
}
