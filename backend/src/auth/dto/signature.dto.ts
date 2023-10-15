export class SignatureDTO {
  UserID: number;
  Signature: string;
  SignedSignature: string;
  MarkdownID: string;

  constructor() {
    this.UserID = undefined;
    this.Signature = undefined;
    this.SignedSignature = undefined;
    this.MarkdownID = undefined;
  }
}
