// this is the abstract class for the batch email sender
// it has a send method that takes an array of emails and an html template

interface BatchEmailSender {
  send(
    emails: string[],
    blogName: string,
    template: string
  ): { failureCount: number; failureEmails: string[] };
}

class BatchEmailSenderFactory {
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