//will handle status code.
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        // super is the constructor of error class
        // it only recieves message from error
        super(message);
        this.statusCode = statusCode;
    }
}

export default ErrorHandler;
