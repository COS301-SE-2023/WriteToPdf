export class ExportDTO {
    MarkdownID: string | undefined;
    Name: string | undefined;
    Content: string | undefined;
    UserID: number | undefined;
    Type: string | undefined;

    constructor() {
        this.MarkdownID = undefined;
        this.Name = undefined;
        this.Content = undefined;
        this.UserID = undefined;
        this.Type = undefined;
    }
}