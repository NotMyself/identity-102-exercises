require('dotenv').config();
const express = require('express');
const http = require('http');
const morgan = require('morgan');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const request = require('request-promise');
const {auth, requiresAuth} = require('express-openid-connect');
const { Issuer } = require('openid-client');


const appUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;

const app = express();

app.set('view engine', 'ejs');

app.use(morgan('combined'));

app.use(session({
  name: 'identity102-lab-02',
  secret: process.env.COOKIE_SECRET,
}));

app.use(bodyParser.urlencoded({ extended: false }));


app.use(auth({
  required: false,
  auth0Logout: true,
  authorizationParams: {
    response_type: 'code id_token',
    audience: process.env.API_AUDIENCE,
    scope: 'openid profile email read:reports offline_access'
  }
}));


app.get('/', (req, res) => {
  res.render('home', { user: req.openid && req.openid.user });
});

app.get('/user', requiresAuth(), (req, res) => {
  res.render('user', { user: req.openid && req.openid.user });
});


app.get('/expenses', requiresAuth(), async (req, res, next) => {
  try {

    let tokenSet = req.openid.tokens;

    if (tokenSet.expired()) {
      const issuer = await Issuer.discover(process.env.ISSUER_BASE_URL);
      const client = new issuer.Client({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      });
      tokenSet = await client.refresh(tokenSet);
      tokenSet.refresh_token = req.openid.tokens.refresh_token;
      req.openid.tokens = tokenSet;
    }

    const expenses = await request(process.env.API_URL, {
      headers: {
        authorization: `Bearer ${tokenSet.access_token}`
      },
      json: true
    });

    res.render('expenses', {
      user: req.openid && req.openid.user,
      expenses,
    });
  } catch (err) {
    next(err);
  }
});


app.get('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err);
});

http.createServer(app).listen(process.env.PORT, () => {
  console.log(`listening on ${appUrl}`);
});
