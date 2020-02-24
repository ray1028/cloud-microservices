const express = require('express');
const fs = require('fs');
const https = require('https');
const app = express();

app.get('/', function (req, res) {
  res.send('hello world');
});

https.createServer({
  key: fs.readFileSync('keys/localhost.key'),
  cert: fs.readFileSync('keys/localhost.cert')
}, app)
.listen(443, function () {
  console.log('Example app listening on port 443! Go to https://localhost:443/');
});
