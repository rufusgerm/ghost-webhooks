import mysql2, { FieldPacket, RowDataPacket } from "mysql2/promise";

const EMAILS_QUERY = `SELECT m.email as email, m.name as name FROM members as m JOIN members_newsletters ON members.id = members_newsletters.member_id JOIN posts as p ON posts.newsletter_id = members_newsletters.newsletter_id WHERE posts.id = ?`;
const NEWSLETTER_QUERY = `SELECT name FROM newsletters JOIN posts ON posts.newsletter_id = newsletters.id WHERE posts.id = ? LIMIT 1`;

const MAX_CXN_RETRIES = 6;
let CONNECTION_ATTEMPTS = 1;

export interface UserData { 
  email: string;
  name: string;
}

export default class MysqlClientProvider {
  constructor() {}

  /**
   * Attempts to connect to the MySQL database using the provided credentials.
   * If the connection fails, it will retry up to MAX_CXN_RETRIES times with an exponential backoff.
   * @returns A Promise that resolves to a boolean indicating whether the connection was successful.
   * @throws An error if the maximum number of connection retries is exceeded.
   */
  public async attemptToConnectMySql(): Promise<boolean> {
    while (CONNECTION_ATTEMPTS <= MAX_CXN_RETRIES) {
      try {
        await this.getConnection();
        console.log("Connected to MySQL");
        return true;
      } catch (error) {
        console.error(
          `Error connecting to MySQL (attempt ${CONNECTION_ATTEMPTS} / ${MAX_CXN_RETRIES}): ${error}`
        );
        await new Promise((resolve) => setTimeout(resolve, this.getRetryDelay(CONNECTION_ATTEMPTS)));
        CONNECTION_ATTEMPTS++;
      }
    }

    throw new Error(
      "Failed to connect to the database after multiple attempts."
    );
  }

  /**
   * Creates a new MySQL connection using the provided credentials.
   * @returns A MySQL connection object.
   */
  async getConnection(): Promise<mysql2.Connection> {
    return await mysql2.createConnection({
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
  async getEmailsByPostId(postId: string): Promise<UserData[]> {
    try {
      let users: UserData[] = [];
      const connection = await this.getConnection();
  
      const [rows, fields] = await connection.execute<RowDataPacket[]>(EMAILS_QUERY, [postId]);
  
      rows.forEach((row) => {
        users.push({
          email: row.email,
          name: row.name,
        });
      });
  
      connection.end()
      return users;
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
      const connection = await this.getConnection();
  
      const [rows, fields] = await connection.execute<RowDataPacket[]>(NEWSLETTER_QUERY, [postId]);
      name = rows[0].name;

      return name;
    } catch (error) {
      console.error(`Error retrieving newsletter name for post ID ${postId}: ${error}`);
      throw error;
    }
  }
}