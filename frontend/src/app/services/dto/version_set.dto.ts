export class VersionSetDTO {
  UserID: number;
  MarkdownID: string;
  DiffHistory: string[];
  SnapshotID: string;

  constructor() {
    this.UserID = 0;
    this.MarkdownID = '';
    this.DiffHistory = [];
    this.SnapshotID = '';
  }
}
