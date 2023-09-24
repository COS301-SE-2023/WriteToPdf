export class ShareReequestDTO {
    UserID: number;
    RecipientEmail: string;
    MarkdownFileID: string;

    constructor() {
        this.UserID = -1;
        this.RecipientEmail = '';
        this.MarkdownFileID = '';
    }
}