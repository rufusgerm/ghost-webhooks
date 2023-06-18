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

export default class MysqlClientProvider {
  client: mysql.Connection;
  constructor() {
    // create mysql client with a host that references the docker service and 
    // gets the user, password, and db name from the env
    this.client = mysql.createConnection({
      host: process.env.DATABASE_CONTAINER_NAME,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });
  }

  getEmailsByPostId(postId: string): string[] {
    let emails: string[] = []
    this.client.query(EMAILS_QUERY, [postId], (error, results) => {
      if (error) {
        throw error;
      } else {
        emails = results.map((result: { email: any; }) => result.email);
      }
    });
    return emails;
  }

  getNewsletterNameByPostId(postId: string): string {
    let name: string = '';
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