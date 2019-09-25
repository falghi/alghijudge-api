const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const hackerEarth = require('hackerearth-node');
const fs = require('fs');

const submitCode = require('./controllers/submitcode');

// GLOBAL VARIABLES
const app = express();

const hackerEarthApi = new hackerEarth(process.env.HACKER_EARTH_API_KEY, '');

const DEBUG = true;

const PORT = process.env.PORT || 3001;
// --

// MIDDLEWARE
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

app.post('/submitcode', submitCode.handleSubmitCode(fs, hackerEarthApi));
// --

// START SERVER
app.listen(PORT, () => {
	console.log(`app is running on port ${PORT}`);
});