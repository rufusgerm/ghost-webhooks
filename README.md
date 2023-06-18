- The way this can be done is to input fake Mailgun credentials
- Now once you go to publish a post, it will give you the option to "email and publish" it

Caveats:
1. Its a little jank
2. Need access to the DB
3. No email tracking/analytics of any kind (yet?)

ENV VARs
1. EMAIL_PROVIDER
  - postmark
  - sendgrid (soon)
2. MAIL_SERVER_API_KEY
3. DATABASE_CONTAINER_NAME
4. MYSQL_USER
5. MYSQL_PASSWORD
6. MYSQL_DATABASE