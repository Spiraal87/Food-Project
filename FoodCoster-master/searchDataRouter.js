const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();
const app = express();
require('dotenv').config();
const jsonParser = bodyParser.json();
const { PORT, DATABASE_URL } = require('./config');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const { userList } = require('./models');
const { authList } = require('./users/models');
const passport = require('passport');
const searchDataRouter = require('./searchDataRouter');
const makeRequestRouter = require('./makeRequestRouter');
mongoose.Promise = global.Promise;


app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());
passport.use(localStrategy);
passport.use(jwtStrategy);
app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/', jwtAuth, (req, res) => {
  authList
    .findById(req.user._id)
    .populate('posts')
    .then(posts => {
      res.status(200).json(posts)
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

router.post('/', jsonParser, jwtAuth, (req, res) => {
  console.log(req.user._id);
  const requiredFields = ['budget', 'location', 'time', 'meals', 'info', 'unit'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  return userList
    .create({
      budget: req.body.budget,
      location: req.body.location,
      meals: req.body.meals,
      time: req.body.time,
      info: req.body.info,
      unit: req.body.unit
    })
    .then(
    searchObject => {
      authList.findByIdAndUpdate(req.user._id,
        { $push: { posts: searchObject._id } }
      )
        .then(() => res.status(201).json(searchObject.serialize()))
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    });
});

router.put('/:id', jwtAuth, (req, res) => {
  console.log(`updating user name ${req.user._id}`);
  const toUpdate = {};
  const updateableFields = ['username', 'firstName', 'lastName'];
  let errorFound = false;
  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    } else {
      const message = `Missing ${field} in request body`;
      console.error(message);
      let errorFound = true;
      return res.status(400).send(message);
    }
  })
  if (errorFound) {
    return
  }
  authList
    .findByIdAndUpdate(req.user._id, { $set: toUpdate }, { new: true })
    .then(nameUpdate => res.json(nameUpdate).status(200).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

router.delete('/:id', jwtAuth, (req, res) => {
  console.log(`${req.params.id}`)
  userList
    .findByIdAndRemove(req.params.id)
    .exec()
    .then((obj) => res.status(200).json(obj))
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});


module.exports = router;