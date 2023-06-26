export class ImportDTO {
    MarkdownID: string | undefined;
    Name: string | undefined;
    Content: string | undefined;
    Path: string | undefined;
    ParentFolderID: string | undefined;
    UserID: number | undefined;
    Type: string | undefined;

    constructor() {
        this.MarkdownID = undefined;
        this.Name = undefined;
        this.Content = undefined;
        this.Path = undefined;
        this.ParentFolderID = undefined;
        this.UserID = undefined;
        this.Type = undefined;
    }
}
