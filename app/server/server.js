"use strict";

// import express from 'express';
// // import bodyParser from 'body-parser';
// // import https from 'https';
// import * as api from './server-api.js';
// import * as websocketApi from './server-websocket-api.js';
const express = require('express');
// const bodyParser = require('body-parser');
// const https = require('https');
const api = require('./server-api.js');
const websocketApi = require('./server-websocket-api.js');

let app = express();
websocketApi.init({});

const rootPath = __dirname + '/app';
// app.use(express.static(__dirname));
// app.use(express.static(__dirname + '/www'));

app.use(express.static(rootPath));


// attach the api and request functions
app = api.init({server: app, rootPath});


const server = app.listen(50021, function() {
    const host = server.address().address,
        port = server.address().port;
    console.log('server running on http://%s:%s at%s', host, port,__dirname);
});