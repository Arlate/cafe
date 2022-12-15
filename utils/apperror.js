export class AppError extends Error {
    constructor(mess,status) {
        super()
        this.message = mess;
        this.statusCode = status;
    }
}