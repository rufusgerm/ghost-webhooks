// import express and generate basic app with one route of /hooks
import express from 'express';
import mysql from 'mysql';

const app = express();

// create mysql client with a host that references the docker service and gets the user, password, and db name from the env
const client = mysql.createConnection({
  host: 'mysql',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});
  


app.get('/', (req, res) => {

    res.send('Hello, what\'s up!');
});

app.post('/hooks', (req, res) => {
  // get the body of the request and parse it as JSON
  const body = JSON.parse(req.body);
  // get the newsletter id from the object
  const newsletterId = body.id;
  // query the database for member emails with said newsletter id
  // parse the return into an array of emails
  // send the emails using the batch sender interface
  // ensure emails were sent correctly, if not catalog which weren't sent
  // log the results of the send
});


app.listen(3000, () => console.log('Ghost Webhooks Server Started Successfully'));