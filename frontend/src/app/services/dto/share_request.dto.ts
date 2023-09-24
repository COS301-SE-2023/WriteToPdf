export class ShareRequestDTO {
    UserID: number | undefined;
    RecipientEmail: string | undefined;
    MarkdownFileID: string | undefined;

    constructor() {
        this.UserID = undefined;
        this.RecipientEmail = undefined;
        this.MarkdownFileID = undefined;
    }
}