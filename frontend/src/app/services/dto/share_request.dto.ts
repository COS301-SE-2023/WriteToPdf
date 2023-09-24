export class ShareRequestDTO {
    UserID: number | undefined;
    RecipientEmail: string | undefined;
    MarkdownID: string | undefined;

    constructor() {
        this.UserID = undefined;
        this.RecipientEmail = undefined;
        this.MarkdownID = undefined;
    }
}