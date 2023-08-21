import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(
      {
        service: 'gmail',
        auth: {
          user: process.env.SYSTEM_EMAIL,
          pass: process.env
            .SYSTEM_MAIL_SERVER_PASSWORD,
        },
      },
    );
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SYSTEM_EMAIL,
      to: to,
      subject: subject,
      text: text,
    });
  }
}
