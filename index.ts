import express from 'express';
import MysqlClientProvider from './mysql/mysqlClientProvider';

const app = express();
let mysql: MysqlClientProvider;
let isServerConfigValid = false;
let batchEmailSender: BatchEmailSender;

try {
  mysql = new MysqlClientProvider();
  batchEmailSender = BatchEmailSenderFactory.createBatchEmailSender("postmark");
  // batchEmailSender = BatchEmailSenderFactory.createBatchEmailSender(process.env.EMAIL_PROVIDER);
  isServerConfigValid = true;
} catch (error) {
  console.error(`Error during configuration of webhooks server: ${error}`);
}

if (isServerConfigValid) {
  app.post('/hooks', (req, res) => {
    // get the body of the request and parse it as JSON
    const postData = JSON.parse(req.body);
    console.log(`postData: ${postData}`);
    // get the post id from the object
    const postId = postData.current.id;
    console.log(`postId: ${postId}`);
    // query the database for member emails with said newsletter id
    const emails: string[] = mysql.getEmailsByPostId(postId);
    const newsletterName: string = mysql.getNewsletterNameByPostId(postId);
  
    const { failureCount, failureEmails } = batchEmailSender
      .send(emails, newsletterName, 'New Post!');
  
    console.log(`${failureCount} emails failed to send`);
    console.log(`Failed emails list: ${failureEmails}`);

    res.status(200).send('OK');
  });


  app.listen(3000, () => console.log('Ghost Webhooks Server Started Successfully'));
} else {
  console.error(
    "Ghost Webhooks Server Failed to Start. Please see previous logs for more information.");
}