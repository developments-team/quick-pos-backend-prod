class AppError extends Error {
    statusCode;
    status;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = false;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
export default AppError;
