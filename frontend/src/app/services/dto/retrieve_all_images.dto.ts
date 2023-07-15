export class RetrieveAllImagesDTO {
    UserID: number | undefined;
    Thumbnails: string[] | undefined;
    FileNames: string[] | undefined;
    DatesCreated: Date[] | undefined;
    ImageIDs: number[] | undefined;
    Sizes: number[] | undefined;

    constructor() {
        this.UserID = undefined;
        this.Thumbnails = undefined;
        this.FileNames = undefined;
        this.DatesCreated = undefined;
        this.ImageIDs = undefined;
        this.Sizes = undefined;
    }
}
