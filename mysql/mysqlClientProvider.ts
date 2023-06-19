import mysql2 from "mysql2";
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
let CONNECTION_ATTEMPTS = 1;

export default class MysqlClientProvider {
  client: mysql2.Connection | null;
  constructor() {
    // create mysql client with a host that references the docker service and
    // gets the user, password, and db name from the env
    this.client = null;
  }

  public async createConnection(): Promise<mysql2.Connection> {

    console.log(`MySql Connection String is: ${process.env.DATABASE_CONTAINER_NAME} ${process.env.MYSQL_USER} ${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE}`)

    const connection = mysql2.createConnection({
      host: "db",
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
    
    connection.connect((error) => {
      if (error) {
        if (CONNECTION_ATTEMPTS > MAX_CXN_RETRIES) throw new Error("MySql connection failure: Max connection retries exceeded")
        console.error(`Error connecting to MySQL (attempt #${CONNECTION_ATTEMPTS}): ${error}`);
        setTimeout(async () => {
          console.log("Retrying MySQL connection...");
          CONNECTION_ATTEMPTS++;
          this.client = await this.createConnection();
        }, this.getRetryDelay(CONNECTION_ATTEMPTS));
      } else {
        console.log("Connected to MySQL");
        CONNECTION_ATTEMPTS = 1;
      }
    });

    return connection;
  }

  /**
   * Calculates the delay (in milliseconds) to wait before retrying a failed MySQL connection.
   * The delay increases exponentially with each retry, up to a maximum of 60 seconds.
   * @returns The delay (in milliseconds) to wait before retrying a failed MySQL connection.
   */
  private getRetryDelay(attempts: number): number {
    const minDelayMillis = 1_000;
    const maxDelayMillis = 60_000;
    const delay = maxDelayMillis < minDelayMillis * 2 ** attempts ? maxDelayMillis : minDelayMillis * 2 ** attempts;
    console.log(`Delaying MySQL connection retry for ${delay}ms`);
    return delay;
  }

  /**
   * Retrieves an array of emails associated with a post ID.
   * @param postId The ID of the post to retrieve emails for.
   * @returns An array of emails associated with the specified post ID.
   */
  getEmailsByPostId(postId: string) {
    if (!this.client) {
      throw new Error("MySQL client not initialized");
    }
    this.client.query(EMAILS_QUERY, [postId], (error, results) => {
      return results;
    });
  }

  /**
   * Retrieves the name of the newsletter associated with a post ID.
   * @param postId The ID of the post to retrieve the newsletter name for.
   * @returns The name of the newsletter associated with the specified post ID.
   */
  getNewsletterNameByPostId(postId: string) {
    if (!this.client) {
      throw new Error("MySQL client not initialized");
    }
    this.client.query(NEWSLETTER_QUERY, [postId], (error, results) => {
      return results;
    });
  }
}