import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: env.smtpUser
    ? {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    : undefined
});

export const sendTransactionalEmail = async ({
  to,
  subject,
  html,
  from
}) => {
  const mailOptions = {
    from:
      from ||
      env.defaultFromEmail ||
      `Coach Dashboard <noreply@${env.defaultBrandName}.io>`,
    to,
    subject,
    html
  };

  if (!env.smtpUser) {
    console.log("Email (mocked):", mailOptions);
    return;
  }

  await transporter.sendMail(mailOptions);
};
