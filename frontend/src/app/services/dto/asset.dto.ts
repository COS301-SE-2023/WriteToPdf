export class AssetDTO {
    AssetID: string | undefined;
    Format: string | undefined;
    FileName: string | undefined;
    ConvertedElement: string | undefined;
    Content: string | undefined;
    DateCreated: Date | undefined;
    Size: number | undefined;
    ParentFolderID: string | undefined;
    Path:string|undefined;
    UserID: number | undefined;

    constructor() {
        this.AssetID = undefined;
        this.Format = undefined;
        this.FileName = undefined;
        this.ConvertedElement = undefined;
        this.Content = undefined;
        this.DateCreated = undefined;
        this.Size = undefined;
        this.ParentFolderID = undefined;
        this.UserID = undefined;
    }
}
