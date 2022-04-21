// import bodyParser from 'body-parser';

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
    console.log('server requested /train ');
    res.sendFile('train.html', { root: rootPath });
  });
  // admin controls - maybe use credentials on this :)
  server.get("/train-admin", function(req, res) {
    console.log('server requested /train-admin ');
    res.sendFile('train-admin.html', { root: rootPath });
  });

  server.get("/train-admin*js", function(req, res) {
    console.log('server requested /train-admin js', req.path);
    res.sendFile('train-admin.html', { root: rootPath });
  });

  
  // server.get('/train*/assets*', function (req, res) {
    
  //   const fileName = '/assets' + req.path.substring(req.path.lastIndexOf('/'), req.path.length);
  //   console.log('assets request ', fileName, req.path)
  //   res.sendFile(fileName, { root: rootPath });
  // });

  return server;
}

module.exports = { init, destroy };
