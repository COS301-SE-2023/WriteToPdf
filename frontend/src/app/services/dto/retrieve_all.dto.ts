export class RetrieveAllDTO {
    UserID: number | undefined;
    Thumbnails: string[] | undefined; // base64 strings
    TextSnippets: string[] | undefined; // text summaries
    FileNames: string[] | undefined; // from db
    DatesCreated: Date[] | undefined; // from db
    ImageIDs: number[] | undefined; // from db
    Sizes: number[] | undefined;

    constructor() {
        this.UserID = undefined;
        this.Thumbnails = undefined;
        this.TextSnippets = undefined;
        this.FileNames = undefined;
        this.DatesCreated = undefined;
        this.ImageIDs = undefined;
        this.Sizes = undefined;
    }
}
