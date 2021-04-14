"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const api = require('./server-api.js');
const websocketApi = require('./server-websocket-api.js');

let app = express();


const rootPath = __dirname + '/www';

// app.use(express.static(__dirname));
// app.use(express.static(__dirname + '/www'));

app.use(express.static(rootPath));


// attach the api and request functions
app = api.init({server: app, rootPath});



// app.get("/", function(req, res) {
//     console.log('server requested / ');
//     // setUserConnection(req);
//     res.sendFile('train.html', { root: rootPath });
// });
// // app.get("/train", function(req, res) {
// //     console.log('server requested /train ');
// //     // setUserConnection(req);
// //     res.sendFile('train.html');
// // });

// app.get("/*html", function(req, res) {
//     console.log('server requested some html file');
//     // setUserConnection(req);
//     res.sendFile('train.html');
//         // res.send(trainHtml.view());
// });



  
// console.log('websocketApi ', websocketApi)


const server = app.listen(50021, function() {
    const host = server.address().address,
        port = server.address().port;
    console.log('server running on http://%s:%s at%s', host, port,__dirname);
});