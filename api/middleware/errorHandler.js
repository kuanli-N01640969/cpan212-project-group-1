// Express knows this is an error handler because it takes four arguments.
// If you write a function with 4 parameters, Express automatically treats it as a special Error-Handling Middleware.
export function errorHandler(err, req, res, next) {
    //sets the HTTP response status code header. the || is for when there is no custom state code attached, it defaults to 500
    const statusCode = err.statusCode || err.status || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
            error: {
                code: statusCode,
                message: message
    }
});
}

    //errorHandler: Catches any sudden crashes, bugs, or explicit errors thrown anywhere in the code (500)