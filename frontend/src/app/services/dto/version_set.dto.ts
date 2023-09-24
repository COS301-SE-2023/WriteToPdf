export class VersionSetDTO {
  UserID: number;
  MarkdownID: string;
  DiffHistory: string[];
  SnapshotID: string;
  IsHeadSnapshot: boolean;

  constructor() {
    this.UserID = 0;
    this.MarkdownID = '';
    this.DiffHistory = [];
    this.SnapshotID = '';
    this.IsHeadSnapshot = false;
  }
}
