export class ImageDTO {
    UserID: number | undefined;
    Content: string | undefined;
    Path: string | undefined;
    ImageID: number | undefined;
    Size: number | undefined;
    DateCreated: Date | undefined;

    constructor() {
        this.Content = undefined;
        this.UserID = undefined;
        this.Path = undefined;
        this.ImageID = undefined;
        this.Size = undefined;
        this.DateCreated = undefined;
    }
}
