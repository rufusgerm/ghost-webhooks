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