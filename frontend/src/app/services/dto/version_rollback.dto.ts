export class VersionRollbackDTO {
    MarkdownID: string|undefined;
    UserID: number|undefined;
    DiffIndex: number|undefined;
    Content: string|undefined;
    constructor() {
        this.MarkdownID = undefined;
        this.UserID = undefined;
        this.DiffIndex = undefined;
        this.Content = undefined;
    }
}
