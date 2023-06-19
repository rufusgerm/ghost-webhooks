import express from 'express';
import bodyParser from 'body-parser';
import MysqlClientProvider from './mysql/mysqlClientProvider';
import BatchEmailSenderFactory, { BatchEmailSender } from './email/batchEmailSender';

const app = express();
app.use(bodyParser.json());

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
    console.log("Configuration successful. Starting webhooks server...");
    isServerConfigValid = true;
  } catch (error) {
    console.error(`Error during configuration of webhooks server: ${error}`);
  }
  
  if (isServerConfigValid) {
    app.post('/hooks', (req, res) => {
      // get the body of the request and parse it as JSON
      const postData = req.body;
      console.log(`postData: ${JSON.stringify(postData)}`);
      // get the post id from the object
      const postId = postData["post"]["current"]["id"];
      console.log(`postId: ${postId}`);
      // query the database for member emails with said newsletter id
      const emails = mysql.getEmailsByPostId(postId);
      console.log(`emailResults: ${emails}`);

      const newsletterName = mysql.getNewsletterNameByPostId(postId);
      console.log(`newsletterNameResults: ${newsletterName}`);
    
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
