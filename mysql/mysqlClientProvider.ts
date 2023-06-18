import mysql from 'mysql';

const EMAILS_QUERY = `SELECT email,  
    FROM members
    JOIN members_newsletters
    ON members.id = members_newsletters.member_id
    JOIN newsletters
    JOIN posts
    ON posts.newsletter_id = members_newsletters.newsletter_id
    WHERE posts.id = ?`;

const NEWSLETTER_QUERY = `SELECT name,
    FROM newsletters
    JOIN posts
    ON posts.newsletter_id = newsletters.id
    WHERE posts.id = ?
    LIMIT 1`;

const MAX_CXN_RETRIES = 6;

export default class MysqlClientProvider {
  client: mysql.Connection;
  constructor() {
    // create mysql client with a host that references the docker service and
    // gets the user, password, and db name from the env
    this.client = this.createConnection();
  }

  private createConnection(): mysql.Connection {
    let connectionAttempts = 1;

    const connection = mysql.createConnection({
      host: process.env.DATABASE_CONTAINER_NAME,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
    
    connection.connect((error) => {
      if (error) {
        if (connectionAttempts > MAX_CXN_RETRIES) throw new Error("MySql connection failure: Max connection retries exceeded")
        console.error(`Error connecting to MySQL (attempt #${connectionAttempts}): ${error}`);
        setTimeout(() => {
          console.log("Retrying MySQL connection...");
          connectionAttempts++;
          this.client = this.createConnection();
        }, this.getRetryDelay());
      } else {
        console.log("Connected to MySQL");
      }
    });

    return connection;
  }

  /**
   * Calculates the delay (in milliseconds) to wait before retrying a failed MySQL connection.
   * The delay increases exponentially with each retry, up to a maximum of 60 seconds.
   * @returns The delay (in milliseconds) to wait before retrying a failed MySQL connection.
   */
  private getRetryDelay(): number {
    const minDelayMillis = 1_000;
    const maxDelayMillis = 60_000;
    const expBackoffFactor = 2;
    const delay = Math.min(
      maxDelayMillis,
      minDelayMillis * Math.pow(expBackoffFactor, MAX_CXN_RETRIES)
    );
    return delay;
  }

  /**
   * Retrieves an array of emails associated with a post ID.
   * @param postId The ID of the post to retrieve emails for.
   * @returns An array of emails associated with the specified post ID.
   */
  getEmailsByPostId(postId: string): string[] {
    let emails: string[] = [];
    this.client.query(EMAILS_QUERY, [postId], (error, results) => {
      if (error) {
        throw error;
      } else {
        emails = results.map((result: { email: any }) => result.email);
      }
    });
    return emails;
  }

  /**
   * Retrieves the name of the newsletter associated with a post ID.
   * @param postId The ID of the post to retrieve the newsletter name for.
   * @returns The name of the newsletter associated with the specified post ID.
   */
  getNewsletterNameByPostId(postId: string): string {
    let name: string = "";
    this.client.query(NEWSLETTER_QUERY, [postId], (error, results) => {
      if (error) {
        throw error;
      } else {
        name = results[0].name;
      }
    });

    return name;
  }
}