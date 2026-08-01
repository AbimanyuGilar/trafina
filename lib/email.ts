import nodemailer, { SendMailOptions, Transporter } from 'nodemailer'

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD
  }
})

interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export async function sendMail({ from, to, subject, html, text }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from, to, subject, text, html
    })
    console.log("nodemailer: ", 'Berhasil kirim email verifikasi')
  } catch (err) {
    console.log("nodemailer: ", err)
  }
}