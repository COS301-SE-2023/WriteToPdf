export class SignatureDTO {
  UserID: number | undefined;
  Signature: string | undefined;
  SignedSignature: string | undefined;
  MarkdownID: string | undefined;

  constructor() {
    this.UserID = undefined;
    this.Signature = undefined;
    this.SignedSignature = undefined;
    this.MarkdownID = undefined;
  }
}
