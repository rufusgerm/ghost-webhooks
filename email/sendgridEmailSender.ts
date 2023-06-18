class SendgridBatchEmailSender implements BatchEmailSender {
  constructor() {
    // import the sendgrid client
    // const sgMail = require("@sendgrid/mail");
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
  send(emails: string[], blogName: string, template: string): { failureCount: number; failureEmails: string[]; } {
    throw new Error("Method not implemented.");
  }
}
