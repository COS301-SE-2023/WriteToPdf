export class SignatureDTO {
  UserID: number;
  Checksum: string;
  Signature: string;
  MarkdownID: string;

  constructor() {
    this.UserID = undefined;
    this.Checksum = undefined;
    this.Signature = undefined;
    this.MarkdownID = undefined;
  }
}
