const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const SSO = require('sso-ui');
const submitCode = require('./controllers/submitcode');

if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// GLOBAL VARIABLES
const app = express();

const DEBUG = true;

const PORT = process.env.PORT || 3001;

var sso = new SSO({
    url: 'https://alghijudgeapi.herokuapp.com', //required
    session_sso: 'sso_user' // defaults to sso_user
});
// --

// MIDDLEWARE
app.use(session({
    secret: process.env.SSO_UI_SECRET,
    resave: false,
    saveUninitialized: true
})); 
app.use(sso.middleware);
app.use(bodyParser.json());
app.use(cors());
// --

// For Debugging only
if (DEBUG) {
}
// --

// ROUTING
app.get('/', (req, resp) => {
	resp.send(`
Visit the frontend: <a href="https://alghijudge.herokuapp.com/">https://alghijudge.herokuapp.com/</a><br>
<br>
MIT License<br>
<br>
Copyright (c) 2019 Firdaus Al-Ghifari<br>
<br>
Github: <a href="https://github.com/darklordace/alghijudge-api">https://github.com/darklordace/alghijudge-api</a>
	`);
});

app.get('/login', sso.login, function(req, res) {
    res.redirect(process.env.FRONT_END_URL_FULL);
});
 
app.get('/user', sso.login, function(req, res) {
    res.json(req.sso_user);
});

app.get('/logout-sso', sso.logout);

app.post('/submitcode', submitCode.handleSubmitCode(fs));
// --

// START SERVER
app.listen(PORT, () => {
	console.log(`app is running on port ${PORT}`);
});