import express from 'express';
import MysqlClientProvider from './mysql/mysqlClientProvider';
import BatchEmailSenderFactory, { BatchEmailSender } from './email/batchEmailSender';

const app = express();

async function setup() { 
  let mysql: MysqlClientProvider;
  let isServerConfigValid = false;
  let batchEmailSender: BatchEmailSender;

  try {
    // need to await this so that the server doesn't start before the connection is established
    mysql = new MysqlClientProvider();
    await mysql.createConnection();
    batchEmailSender = BatchEmailSenderFactory.createBatchEmailSender("postmark");
    // batchEmailSender = BatchEmailSenderFactory.createBatchEmailSender(process.env.EMAIL_PROVIDER);
    isServerConfigValid = true;
  } catch (error) {
    console.error(`Error during configuration of webhooks server: ${error}`);
  }
  
  if (isServerConfigValid) {
    console.log("Configuration successful. Starting webhooks server...");
    app.post('/hooks', (req, res) => {
      console.log(`request received: ${req}`)
      // get the body of the request and parse it as JSON
      const postData = JSON.parse(req.body);
      console.log(`postData: ${postData}`);
      // get the post id from the object
      const postId = postData.current.id;
      console.log(`postId: ${postId}`);
      // query the database for member emails with said newsletter id
      const emailResults = mysql.getEmailsByPostId(postId);
      console.log(`emailResults: ${emailResults}`);

      const newsletterNameResults = mysql.getNewsletterNameByPostId(postId);
      console.log(`newsletterNameResults: ${newsletterNameResults}`);
    
      // const { failureCount, failureEmails } = batchEmailSender
      //   .send(emails, newsletterName, 'New Post!');
    
      // console.log(`${failureCount} emails failed to send`);
      // console.log(`Failed emails list: ${failureEmails}`);
  
      res.status(200).send('OK');
    });
  
  
    app.listen(3000, () => console.log('Ghost Webhooks Server Started Successfully'));
  } else {
    console.error(
      "Ghost Webhooks Server Failed to Start. Please see previous logs for more information.");
    return;
  }

}

setup();