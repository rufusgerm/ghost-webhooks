import mysql2, { FieldPacket, RowDataPacket } from "mysql2";

const EMAILS_QUERY = `SELECT email FROM members JOIN members_newsletters ON members.id = members_newsletters.member_id JOIN posts ON posts.newsletter_id = members_newsletters.newsletter_id WHERE posts.id = ?`;
const NEWSLETTER_QUERY = `SELECT name FROM newsletters JOIN posts ON posts.newsletter_id = newsletters.id WHERE posts.id = ? LIMIT 1`;

const MAX_CXN_RETRIES = 6;
let CONNECTION_ATTEMPTS = 1;

export default class MysqlClientProvider {
  constructor() {}

  /**
   * Attempts to connect to the MySQL database using the provided credentials.
   * If the connection fails, it will retry up to MAX_CXN_RETRIES times with an exponential backoff.
   * @returns A Promise that resolves to a boolean indicating whether the connection was successful.
   * @throws An error if the maximum number of connection retries is exceeded.
   */
  public async attemptToConnectMySql(): Promise<boolean> {
    let isConnectionSuccessful = false;
    const connection = this.getConnection();
    
    connection.connect((error) => {
      if (error) {
        if (CONNECTION_ATTEMPTS > MAX_CXN_RETRIES) throw new Error("MySql connection failure: Max connection retries exceeded")
        console.error(`Error connecting to MySQL (attempt ${CONNECTION_ATTEMPTS} / ${MAX_CXN_RETRIES}): ${error}`);
        setTimeout(async () => {
          CONNECTION_ATTEMPTS++;
          await this.attemptToConnectMySql();
        }, this.getRetryDelay(CONNECTION_ATTEMPTS));
      } else {
        console.log("Connected to MySQL");
        isConnectionSuccessful = true;
        CONNECTION_ATTEMPTS = 1;
      }
    });

    return isConnectionSuccessful;
  }

  /**
   * Creates a new MySQL connection using the provided credentials.
   * @returns A MySQL connection object.
   */
  getConnection(): mysql2.Connection {
    return mysql2.createConnection({
      host: "db",
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
  }

  
  /**
   * Calculates the delay time for retrying a failed MySQL connection attempt.
   * @param attempts The number of connection attempts made so far.
   * @returns The delay time in milliseconds.
   */
  private getRetryDelay(attempts: number): number {
    const minDelayMillis = 1_000;
    const maxDelayMillis = 60_000;
    const delay = maxDelayMillis < minDelayMillis * 2 ** attempts ? maxDelayMillis : minDelayMillis * 2 ** attempts;
    console.log(`Delaying MySQL connection retry for ${delay}ms`);
    return delay;
  }

  /**
    * Retrieves the emails associated with a post ID.
    * @param postId The ID of the post to retrieve the emails for.
    * @returns An array of emails associated with the specified post ID.
    * @throws An error if there was an issue retrieving the emails.
    */
  async getEmailsByPostId(postId: string): Promise<string[]> {
    try {
      let emails: string[] = [];
      const connection = this.getConnection();
  
      const [rows, fields] = await connection.promise().execute<RowDataPacket[]>(EMAILS_QUERY, [postId]);
  
      rows.forEach((row) => {
        emails.push(row.email);
      });
  
      connection.end()
      return emails;
    } catch (error) {
      console.error(`Error retrieving emails for post ID ${postId}: ${error}`);
      throw error;
    }

  }

  /**
   * Retrieves the name of the newsletter associated with a post ID.
   * @param postId The ID of the post to retrieve the newsletter name for.
   * @returns The name of the newsletter associated with the specified post ID.
   * @throws An error if there was an issue retrieving the newsletter name.
   */
  async getNewsletterNameByPostId(postId: string): Promise<string> {
    try { 
      let name: string = "";
      const connection = this.getConnection();
  
      const [rows, fields] = await connection.promise().execute<RowDataPacket[]>(NEWSLETTER_QUERY, [postId]);
      name = rows[0].name;

      return name;
    } catch (error) {
      console.error(`Error retrieving newsletter name for post ID ${postId}: ${error}`);
      throw error;
    }
  }
}