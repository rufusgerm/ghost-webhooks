import { BatchEmailSender } from "./batchEmailSender";

/**
 * The maximum number of emails that can be sent in a single batch.
 */
const BATCH_SIZE = 500;

type BatchResponse = {
  ErrorCode: number,
  Message: string,
  MessageID: string,
  SubmittedAt: string,
  To: string
}

/**
 * A class that implements the `BatchEmailSender` interface using the Postmark email service.
 * This class can be used to send batches of emails using the Postmark API.
 */
export default class PostmarkBatchEmailSender implements BatchEmailSender {
  // ...
  pmClient: any;

  constructor() {
    // import the postmark client
    let postmark = require("postmark");
    const serverToken = process.env.MAIL_SERVER_API_KEY;
    this.pmClient = new postmark.ServerClient(serverToken);
  }

  /**
   * Sends a batch of emails to the recipients using the Postmark email service.
   * @param emails An array of email addresses to send the emails to.
   * @param blogName The name of the blog that the email is being sent from.
   * @param template The HTML template to use for the email body.
   * @returns An object containing the number of emails that failed to send and an array of the email addresses that failed.
   */
  send(
    emails: string[],
    blogName: string,
    template: string
  ): { failureCount: number; failureEmails: string[] } {
    const batches = Math.ceil(emails.length / BATCH_SIZE);
    let failureCount = 0;
    let failureEmails: string[] = [];

    for (let i = 0; i < batches; i++) {
      const batch = emails.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

      const emailBatch = batch.map((email) => {
        return {
          From: `${process.env.MAIL_FROM}`,
          To: email,
          Subject: `${blogName} Added a New Post!`,
          HtmlBody: template,
        };
      });

      this.pmClient
        .sendEmailBatch(emailBatch)
        .then((response: BatchResponse[]) => {
          response.forEach((result: BatchResponse) => {
            if (result.Message !== "OK" || result.ErrorCode !== 0) {
              failureCount++;
              failureEmails.push(result.To);
            }
          });
        });
    }

    return { failureCount, failureEmails };
  }
}