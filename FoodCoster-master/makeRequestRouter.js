const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const axios = require('axios');
const mongoose = require('mongoose');
const router = express.Router();
const app = express();
require('dotenv').config();
const jsonParser = bodyParser.json();
const {PORT, DATABASE_URL} = require('./config');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');
const {userList} = require('./models');
const {authList} = require('./users/models');
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


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    next();
});

router.get('/:cityName', function (req, res) {
var instance = axios.create();

instance.get(`https://www.numbeo.com/api/city_prices?api_key=4uxocu7eiqwid6&query=${req.params.cityName}&currency=USD`, {
    headers: {'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE',
    }
})
.then(function (response) {
    const data = {
    data: response.data.prices[0],
    currency: response.data.currency
    }
    console.log(data)
    res.json(data);
})
.catch(function (error) {
    
});
});

module.exports = router;