const express = require('express');
const http = require('http');
const path = require('path');
const app = express();
const env = require('./env.json');
const bodyParser = require('body-parser');

const api = require('./server/api');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'dist')));

/* Load https certificates */

app.get('/config', (req, res) => {
  res.json({server_url: env.backend_url});
});

app.use('/api', api);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

/* Start https server */

const port = process.env.PORT || '3000';
app.set('port', port);


const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));