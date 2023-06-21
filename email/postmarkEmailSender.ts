import { BatchEmailSender } from "./batchEmailSender";
import postmark from "postmark";
import { UserData } from "../mysql/mysqlClientProvider";
import { NewsletterData } from "..";

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

// THIS WILL NEED TO BE CHANGED TO MATCH YOUR OWN POSTMARK TEMPLATE
type PostmarkTemplateModel = {
	authorName: string,
	newsletterName: string,
	authorImage: string,
	username: string,
	postUrl: string
}


/**
 * A class that implements the `BatchEmailSender` interface using the Postmark email service.
 * This class can be used to send batches of emails using the Postmark API.
 */
export default class PostmarkBatchEmailSender implements BatchEmailSender {
  // ...
  pmClient: any;

  constructor(apiKey: string) {
    // import the postmark client
      this.pmClient = new postmark.ServerClient(
        apiKey
      );
  }

  /**
   * Sends a batch of emails to the specified users using the provided newsletter data.
   * Returns an array of email addresses that failed to send.
   * @param userData An array of user data objects containing the email addresses and names of the recipients.
   * @param newsletter An object containing the data for the newsletter being sent.
   * @returns An array of email addresses that failed to send.
   */
  send(
    userData: UserData[],
    newsletter: NewsletterData
  ): string[] {
    let failedEmails: string[] = [];
    const emailFrom = process.env.MAIL_FROM;
    const templateId = process.env.MAIL_TEMPLATE_ID;
    const postUrl = process.env.POST_URL + '/' + newsletter.postSlug;
    
    const batches = Math.ceil(userData.length / BATCH_SIZE);
    
    for (let i = 0; i < batches; i++) {
      const batch = userData.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
      const emailBatch = batch.map((user) => {
        const model: PostmarkTemplateModel = {
            username: user.name,
            newsletterName: newsletter.name,
            authorName: newsletter.author.name,
            authorImage: newsletter.author.image,
            postUrl: postUrl,
        }
        
        return {
          From: emailFrom,
          To: user.email,
          TemplateId: templateId,
          TemplateModel: model
        };
      });

      this.pmClient
        .sendEmailBatch(emailBatch)
        .then((response: BatchResponse[]) => {
          response.forEach((result: BatchResponse) => {
            if (result.Message !== "OK" || result.ErrorCode !== 0) {
              failedEmails.push(result.To);
            }
          });
        });
    }

    return failedEmails;
  }
}