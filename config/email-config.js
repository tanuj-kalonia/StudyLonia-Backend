import nodemailer from 'nodemailer';



export const mailSender = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: "studylonia@gmail.com",
        pass: "qvwttrhjpjluxpik"
    }
})
