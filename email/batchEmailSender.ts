import PostmarkBatchEmailSender from "./postmarkEmailSender";
import SendgridBatchEmailSender from "./sendgridEmailSender";

export interface BatchEmailSender {
  send(
    emails: string[],
    blogName: string,
    template: string
  ): { failureCount: number; failureEmails: string[] };
}

export default class BatchEmailSenderFactory {
  /**
   * Creates a new instance of `BatchEmailSender` based on the specified email provider.
   * @param {string} provider - The email provider to use. Valid values are "postmark" and "sendgrid".
   * @returns {BatchEmailSender} A new instance of `BatchEmailSender` for the specified email provider.
   * @throws {Error} If the specified email provider is invalid.
   */
  static createBatchEmailSender(provider: string): BatchEmailSender {
    switch (provider.toLowerCase()) {
      case "postmark":
        return new PostmarkBatchEmailSender();
      case "sendgrid":
        return new SendgridBatchEmailSender();
      default:
        throw new Error(`Invalid email provider: ${provider}`);
    }
  }
}