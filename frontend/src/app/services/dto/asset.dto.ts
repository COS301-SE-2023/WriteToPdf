export class AssetDTO {
    AssetID: number | undefined;
    Format: string | undefined;
    FileName: string | undefined;
    ConvertedElement: string | undefined;
    Image: string | undefined;
    DateCreated: Date | undefined;
    Size: number | undefined;
    ParentFolderID: string | undefined;
    UserID: number | undefined;

    constructor() {
        this.AssetID = undefined;
        this.Format = undefined;
        this.FileName = undefined;
        this.ConvertedElement = undefined;
        this.Image = undefined;
        this.DateCreated = undefined;
        this.Size = undefined;
        this.ParentFolderID = undefined;
        this.UserID = undefined;
    }
}
