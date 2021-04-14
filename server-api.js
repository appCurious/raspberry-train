const bodyParser = require('body-parser');

const init = (options) => {

  // could read in a data file or make db call for train data
  // setup model
  // model.x = options.whatever
  // as a note --> no need to store the server
  return setupApi (options);
};

const destroy = (trainId) => {

};


function setupApi ({server,rootPath}) {
  server.get("/", function(req, res) {
    console.log('server requested / ');
    res.sendFile('train.html', { root: rootPath });
  });
  server.get("/train", function(req, res) {
    console.log('server requested / ');
    res.sendFile('train.html', { root: rootPath });
  });
  // admin controls - maybe use credentials on this :)
  server.get("/train-admin", function(req, res) {
    console.log('server requested /train-admin ');
    res.sendFile('train-admin.html', { root: rootPath });
  });

  return server;
}

module.exports = { init, destroy };
