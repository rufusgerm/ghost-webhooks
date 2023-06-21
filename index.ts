import express from 'express';
import bodyParser from 'body-parser';
import MysqlClientProvider, { UserData } from './mysql/mysqlClientProvider';
import BatchEmailSenderFactory, { BatchEmailSender } from './email/batchEmailSender';

const app = express();
app.use(bodyParser.json());

interface PostData {
  post: {
    current: {
      id: string;
      slug: string;
      primary_author: {
        name: string;
        profile_image: string;
        url: string;
      };
    };
  };
}

export interface NewsletterData {
  name: string,
  author: {
    name: string,
    image: string,
  },
  postSlug: string,
}

/**
 * Sets up the Ghost Webhooks server by configuring the MySQL client provider and the BatchEmailSender.
 * If the server configuration is valid, it starts the server and listens on port 3000.
 */
async function setup() {
  let isServerConfigValid = false;
  let batchEmailSender: BatchEmailSender;
  let mysql = new MysqlClientProvider();

  try {
    if (await mysql.attemptToConnectMySql()) {
      isServerConfigValid = true;
    }
    if (!process.env.EMAIL_PROVIDER) {
      throw new Error("EMAIL_PROVIDER environment variable not set");
    }
    batchEmailSender = BatchEmailSenderFactory.createBatchEmailSender(process.env.EMAIL_PROVIDER);
  } catch (error) {
    console.error(`Error during configuration of webhooks server: ${error}`);
    isServerConfigValid = false;
  }
  
  if (isServerConfigValid) {
    console.log("Configuration successful. Starting webhooks server...");
    app.post('/hooks', async (req, res) => {
      // get the body of the request and parse it as JSON
      const postData: PostData = req.body;
      // get the post id from the object
      const postId = postData.post.current.id;
      try { 
        const usersToEmail: UserData[] = await mysql.getEmailsByPostId(postId);
  
        const newsletterName = await mysql.getNewsletterNameByPostId(postId);

        let newsletterData = {
          name: newsletterName,
          author: {
            name: postData.post.current.primary_author.name,
            image: postData.post.current.primary_author.profile_image,
          },
          postSlug: postData.post.current.slug
        }
      
        const failureEmails = batchEmailSender
          .send(usersToEmail, newsletterData);
      
        if (failureEmails.length > 0) {
          console.error(
            `${failureEmails.length} emails failed to send out of ${usersToEmail.length} total`
          );
          console.error(`Failed emails list: ${failureEmails}`);
        }
        
      } catch (error) {
        console.error(`Error retrieving emails for post ID ${postId}: ${error}`);
        throw error;
      }
    });
  
    app.listen(3000, () => console.log('Ghost Webhooks Server Started Successfully. Now listening on port 3000...'));
  } else {
    console.error(
      "Ghost Webhooks Server Failed to Start. Please see previous logs for more information.");
    return;
  }

}

setup();
