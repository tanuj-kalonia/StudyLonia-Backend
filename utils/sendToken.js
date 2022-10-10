export const sendToken = (res, user, message, statusCode) => {

    const token = user.getJWTToken();
    // This token will be used to authenticate the user after login

    const options = {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none"

    }
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message,
        user
    })

}