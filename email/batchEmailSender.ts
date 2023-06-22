import { NewsletterData } from "..";
import { UserData } from "../mysql/mysqlClientProvider";
import PostmarkBatchEmailSender from "./postmarkEmailSender";
import SendgridBatchEmailSender from "./sendgridEmailSender";

export interface BatchEmailSender {
  send(
    userData: UserData[],
    newsletterData: NewsletterData
  ): string[];
}

export default class BatchEmailSenderFactory {
  /**
   * Creates a new instance of `BatchEmailSender` based on the specified email provider.
   * @param {string} provider - The email provider to use. Valid values are "postmark" and "sendgrid".
   * @returns {BatchEmailSender} A new instance of `BatchEmailSender` for the specified email provider.
   * @throws {Error} If the specified email provider is invalid.
   */
  static createBatchEmailSender(provider: string): BatchEmailSender {
    if (!process.env.MAIL_SERVER_API_KEY || !process.env.MAIL_TEMPLATE_ID)
      throw new Error("MAIL_SERVER_API_KEY is not defined");
    
    switch (provider.toLowerCase()) {
      case "postmark":
        return new PostmarkBatchEmailSender(process.env.MAIL_SERVER_API_KEY);
      case "sendgrid":
        return new SendgridBatchEmailSender(process.env.MAIL_SERVER_API_KEY);
      default:
        throw new Error(`Invalid email provider: ${provider}`);
    }
  }
}