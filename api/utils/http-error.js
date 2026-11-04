export class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'HttpError';
    }
}

//Throw one of these from a route handler and the error handler turns it into a JSON response.