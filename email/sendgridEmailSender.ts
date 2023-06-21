import { NewsletterData } from "..";
import { UserData } from "../mysql/mysqlClientProvider";
import { BatchEmailSender } from "./batchEmailSender";

export default class SendgridBatchEmailSender implements BatchEmailSender {
  constructor(apiKey: string) {
    // how to use bulk email with sendgrid
    // https://www.twilio.com/blog/sending-bulk-emails-3-ways-sendgrid-nodejs
    // import the sendgrid client
    // const sgMail = require("@sendgrid/mail");
    // sgMail.setApiKey(process.env.MAIL_SERVER_API_KEY);
  }
  send(
    userData: UserData[],
    newsletter: NewsletterData
  ): string[] {
    throw new Error("Method not implemented.");
  }
}
