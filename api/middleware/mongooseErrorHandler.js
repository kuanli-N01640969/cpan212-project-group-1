//Mongoos error handler runs first with database related error then calls next err

export function mongooseErrorHandler (err, req, res, next) {
    //Validation error (required, min/max, enum, custom, or field cast failure)
    if (err.name === "ValidationError" && err.errors){
        const details = Object.entries(err.errors).map(([field, fieldError]) => ({
            field,
            message: fieldError.message,
        }));

        return res.status(400).json({
            success: false,
            error: {
                code: 400,
                message: "Validation failed",
                details,
            },
        });
    }

    //When value cannot be cast to the schema's type
    if (err.name === "CastError"){
        return res.status(400).json({
            success: false,
            error: {
                code: 400,
                message: "Validation failed",
                details: [
                    {
                        field: err.path || "value",
                        message: err.message,
                    },
                ],
            },
        });
    }

    //Non-mongoose error pass chain to errorHandler
    return next(err);
}
