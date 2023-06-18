// import express and generate basic app with one route of /hooks
import express from 'express';
import MysqlClientProvider from './mysql/mysqlClientProvider';

const app = express();

const mysql = new MysqlClientProvider();
// const batchEmailSender = BatchEmailSenderFactory.createBatchEmailSender('process.env.EMAIL_PROVIDER');
const batchEmailSender = BatchEmailSenderFactory.createBatchEmailSender('postmark');
  

app.get('/', (req, res) => {
    res.send('Hello, what\'s up!');
});

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