const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const hackerEarth = require('hackerearth-node');
const fs = require('fs');

const submitCode = require('./controllers/submitcode');

// GLOBAL VARIABLES
const app = express();

const hackerEarthApi = new hackerEarth('**********', '');

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
app.post('/submitcode', submitCode.handleSubmitCode(fs, hackerEarthApi));
// --

// START SERVER
app.listen(PORT, () => {
	console.log(`app is running on port ${PORT}`);
});