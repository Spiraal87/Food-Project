const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const router = express.Router();
const app = express();
require('dotenv').config();
const {PORT, DATABASE_URL} = require('./config');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const searchDataRouter = require('./searchDataRouter');
const makeRequestRouter = require('./makeRequestRouter');
mongoose.Promise = global.Promise;


app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/searchData', searchDataRouter);
app.use('/makeRequest', makeRequestRouter);



let server;
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect()
          .on('error', err => {
            mongoose.disconnect();
            console.log(err);
            reject(err);
          });
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

  
module.exports = {app, runServer, closeServer};



