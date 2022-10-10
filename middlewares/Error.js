const ErrorMiddleware = (err, req, res, next) => {

    // by default we dont get any statsCode, so it will return undefined all the time.
    // to solve this, we need explicitly define in the error class
    // about this status Code.
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Server failed to load resources !";

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};

export default ErrorMiddleware;
