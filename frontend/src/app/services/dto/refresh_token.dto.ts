export class RefreshTokenDTO {
    UserID: number | undefined;
    Email: string | undefined;
    Token: string | undefined;
    ExpiresAt: Date | undefined;

    constructor() {
        this.UserID = undefined;
        this.Email = undefined;
        this.Token = undefined;
        this.ExpiresAt = undefined;
    }
}
