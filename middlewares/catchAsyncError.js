//This will revieve an async function 
// it will wrap the func in a try catch block.
// we dont have to repeate same lines everytime.

export const catchAsyncError = (passedFunction) => (req, res, next) => {
    Promise.resolve(passedFunction(req, res, next)).catch(next);
};