export class SignatureDTO {
  UserID: number | undefined;
  Checksum: string | undefined;
  Signature: string | undefined;
  MarkdownID: string | undefined;

  constructor() {
    this.UserID = undefined;
    this.Checksum = undefined;
    this.Signature = undefined;
    this.MarkdownID = undefined;
  }
}
