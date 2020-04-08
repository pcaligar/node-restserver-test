//requires
const express = require('express');

//const
const app = express();


app.use(require('./login'));
app.use(require('./usuario'));


module.exports = app;