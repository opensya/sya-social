import * as nodemailer from "nodemailer";

export default async function sender(options: nodemailer.SendMailOptions) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: parseInt(process.env.MAILER_PORT),
    secure: process.env.MAILER_SECURE ? true : false,
    auth: {
      user: process.env.MAILER_USER.split(" | ")[0],
      pass: process.env.MAILER_USER.split(" | ")[1],
    },
  });

  const mailOptions = {
    ...options,
    from: `"Tarico SRH - ${process.env.MAILER_USER.split(" | ")[2]}" <${process.env.MAILER_USER.split(" | ")[0]}>`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  } finally {
    transporter.close();
  }
}
