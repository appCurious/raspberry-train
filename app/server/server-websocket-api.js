const WebSocket = require('ws');
const fs = require('fs');
const dccComm = require('./server-dcc-comm.js');

function init (configs) {

  const  apiModel = {
    // data will be duplicated and attached to the client
    // duplication is so that in the event the client closes we can stop the runaway train
    trainsInUse: [
        // copy of the raspberryTrainData //
    ],
    nextClientId: 0,
    // keep the keys and the id's the same for easy reference
    // bodyType: Cowel | Cab | Hood
    trains: {
      'santa-fe-blue': {
        id: 'santa-fe-blue',
        dccId: '3',
        mainColor: '#000080',
        secondColor: '#ffff00',
        displayName: 'SantaFe Blue',
        speed: 0,
        directionForward: true,
        type: 'diesel-electric',
        bodyType: 'Cowl',
        controlType: 'Train'

      },
      'wisconsin-southern-red': {
        id: 'wisconsin-southern-red',
        dccId: 3312,
        mainColor: '#ed143d',
        secondColor: '#000000',
        displayName: 'Wisconsin - Southern Red',
        speed: 0,
        directionForward: true,
        type: 'diesel-electric',
        bodyType: 'Cowl',
        controlType: 'Train'
      }
    },

  };

  // future use
  const _config = {
    timeoutForRequestCall: 60000
  };
  _config.errorMessages = {
    timeout: "Data request has no response after " + _config.timeoutForRequestCall +  "milliseconds.",
    failed: "Data request failed "
  };

  // start simple we are on port 55555
  readConfigurations();
  function readConfigurations(){
    const _fileName = "setup.json";
    _readFile(
      {
        filePath: _fileName,
        dataType: "json",
        contentType: "application/json"
      },
      setConfigurations
    );
  }

  function _readFile(data,cb){
    //{fileName:_fileName,,dataType: "json",contentType: "application/json"}
    if(!data){if(cb){cb();}}
    
    try{
      const _fileData = fs.readFileSync(data.filePath,'utf8');
      if(cb){cb(JSON.parse(_fileData));}
      
    }catch(e){
      if(cb){cb({error:{message: e}});}
    }
    
  }

  function setConfigurations(data) {
    // set baud rate for comms
    // set train data for users
    // set urls and ports

  }

  // WebSocket // 

  /*
  ///// ** web socket communication controls ** ////////
  Pick a port number from 49152 through 65535 - be sure to update the app/systemconfig.json
  */
  const wss = new WebSocket.Server({ port: 55555 });
  console.log("raspberry train communication service started ");
  // Broadcast to all.
  wss.broadcast =  (data) => {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        sendData(client, data);
      }
    });
  };

  wss.sendTo = (data) => {
    const client = wss.clients[data.sendTo];
    if (client) {
      sendData(client, data);
    } else {
      console.log('no client from that data unable to send data \n\n\n\n');
    }
  }
  

  wss.on('connection', (client) => {
    attachRaspberryTrainData(client);

    // setup communications
    client.on('message', _handleMessages ) ;
    client.on('close', _handleClientClosed );

    // send train data with connection success message
    sendData(client, {
      type: 'connection',
      info:"Connected To Raspberry Train Control Command",
      error: null,
      raspberryTrainData: client.raspberryTrainData
    });

  });

  //  Client Communication
  function sendData (client, data) {
    client.send(JSON.stringify(data));
  }

  // Attach Train Data To Client

  function attachRaspberryTrainData (client) {
    const id = apiModel.nextClientId++;
    
    client.raspberryTrainData = {
      clientId: id,
      trainSelected: null,
      selectionsAvailable: getSelectionsAvailable(),
      isEmergency: undefined
    };
    
  }

  // Train functions //

  function getSelectionsAvailable () {
    let keys = Object.keys(apiModel.trains);

    apiModel.trainsInUse.map(function (train) {
      const idx = keys.indexOf(train.trainId);
      if (idx > -1) keys.splice(idx,1);
    });

    return keys.reduce(function (acc,train) {
      acc.push(apiModel.trains[train]);
      return acc;
    },[]);


  }


  function selectTrain ({clientId, trainId}) {
    let inUse = false;
    apiModel.trainsInUse.forEach( (trainData) => {
        inUse = inUse || trainData.trainId === trainId;
    });

    if (inUse) {
      wss.sendTo({
        sendTo: clientId,
        info: 'unable to select that train - already in use'
      });

      wss.broadcast({
        info: 'new selections available',
        selectionsAvailable: getSelectionsAvailable(),
        trainSelection: false
      });

    } else {

      const train = apiModel.trains[trainId];
      
      wss.clients.forEach( function(client) {

        if (client.raspberryTrainData.clientId === clientId) {

          client.raspberryTrainData.trainSelected = train;

          // activate the train on dcc controller
          client.raspberryTrainData.trainSelected.speed = 1;
          moveTrain (client.raspberryTrainData.trainSelected);

          apiModel.trainsInUse.push({
            trainId,
            clientId,
            raspberryTrainData: client.raspberryTrainData
          });

          client.raspberryTrainData.selectionsAvailable = getSelectionsAvailable();        

          sendData (client, {
            info: 'train is ready to run',
            trainSelection: true,
            raspberryTrainData: client.raspberryTrainData
          });
      
        }

      });

      wss.broadcast({
        info: 'trains were removed from selection',
        selectionsAvailable: getSelectionsAvailable()
      });

    }

    
  }

  function removeTrainInUse (compareThese, prop, findItKeepIt) {
    // compareThese []
    // prop string: clientId | trainId
    // findItKeepIt: remove_if_found | keep_if_found | remove_if_not_found | keep_if_not_found

    const _find = (indexOf, me, findItKeepIt) => {
    
      const result = findItKeepIt ? indexOf.indexOf(me) >= 0 : indexOf.indexOf(me) < 0;
      console.log('indexOf ', indexOf, ' me ', me, ' finditKeepit',findItKeepIt, ' result ', result)
      return result
    };

    const parkTrains = [];

    apiModel.trainsInUse = apiModel.trainsInUse.reduce(function (acc, train) {
      // keep if true
      if ( _find(compareThese, train[prop], findItKeepIt) ) { 
          acc.push(train);
      } else {
        parkTrains.push(train)
      }

      return acc;
    },[]);

    console.log('in use after close ',apiModel.trainsInUse)

    parkTrains.forEach((train) => {
      resetTrain(train.raspberryTrainData);
    });

    wss.broadcast({
      info: 'trains were added to selection',
      selectionsAvailable: getSelectionsAvailable()
    });
  }

  // send comands to STATION CONTROL
  // slow to stop
  // set directionForward to true
  // remove train from inUse
  // remove trainSelected from client
  function resetTrain (raspberryTrainData) {
    console.log('reset train ', raspberryTrainData)
    const trainId = raspberryTrainData.trainSelected.id;
    console.log('reset train ', trainId)
    moveTrain({dccId: raspberryTrainData.trainSelected.dccId, directionForward: true, speed: 0 });

    let selectedClient;
    wss.clients.forEach( function(client) {
      if (client.raspberryTrainData.clientId === raspberryTrainData.clientId) {
        selectedClient = client;
        console.log('should find client to remove train')
        // client.raspberryTrainData.trainSelected = null;
  console.log('client trainData removed train seleted ', client.raspberryTrainData)
        removeTrainInUse( [trainId], 'trainId', false);
        // safe to remove trainSelected;
        selectedClient.raspberryTrainData.trainSelected = null;
        selectedClient.raspberryTrainData.selectionsAvailable = getSelectionsAvailable();
        sendData(selectedClient,
          {raspberryTrainData: client.raspberryTrainData}
        );
      }
    });
  }

  function moveTrain ({dccId, directionForward, speed, accId}) { 
  // add client id in the event of an exception or failure we can communicate back
      dccComm.sendCommand({
        update: true,
        control: {
          dccId,
          directionForward,
          speed,
          controlType: 'Train'
        }
      });
  }

  function trainFunction (command) {

    switch (command.setFunction) {
      case 'lights': 
        dccComm.sendCommand({
          update: true,
          control: {
            setFunction: 'lights',
            active: command.train.trainSelected.lightsOn,
            dccId: command.train.trainSelected.dccId,
            controlType: 'TrainFunction'
          }
        });
        break;
      default: break;
    }
  }

  function clearEmergency() {
    console.log('CLEAR E-Stop')
    // reset isEmergency for trains in use
    apiModel.trainsInUse.forEach((train) => {
      train.isEmergency = false;
    });
    // reset client traind data isEmergency
    wss.clients.forEach( (client) => {
      client.raspberryTrainData.isEmergency = false;
        sendData(client,
          {raspberryTrainData: client.raspberryTrainData}
        );
      });
  }
  function emergencyStop (raspberryTrainData) {
    console.log('emergencyStop called ')
    
    // communicate emergency
    // might be fun to have an interlock that disables all their controls so it looks wrecked :)
    wss.broadcast({
      info: 'Emergency stop was activated',
      isEmergency: true
    });

    // stop this train first
    if (raspberryTrainData.trainSelected) {
        moveTrain({dccId: raspberryTrainData.trainSelected.dccId, directionForward: true, speed: 0 });
    }

    // full stop every train
    // to ensure safety we should send all train data -- not just the ones listed in apiModel.trainsInUse
    Object.keys(apiModel.trains).forEach( (key) => {
      const train = apiModel.trains[key];
      moveTrain({dccId: train.dccId, directionForward: true, speed: 0 });
    });
    apiModel.trainsInUse.forEach((train) => {
      train.speed = 0;
      train.directionForward = true;
    });

    // also send data update to all web clients setting their speeds to 0
    wss.clients.forEach( (client) => { 
      if (client.raspberryTrainData.trainSelected) {
        client.raspberryTrainData.trainSelected.speed = 0;
        client.raspberryTrainData.trainSelected.directionForward = true;
      }
      client.raspberryTrainData.isEmergency = true;
        sendData(client,
          {raspberryTrainData: client.raspberryTrainData}
        );
      });

    // might also send a signal to cut power to tracks
  }


  /**
   * 
   * @param {} command // 
   */
  function _handleTrainCommands (message) {
    console.log('train command ', message)

    // we will have to keep these in sync with:
    // client.raspberryTrain.selectedTrain
    // apiModel.trains
    const commands = message.trainCommands;
    if (commands.emergency) {
      emergencyStop(commands.emergency);
    }
    if (commands.allClear) {
      clearEmergency();
    }

    // train commands
    if (commands.parkTrain) {
      resetTrain(commands.parkTrain);
    }
    if (commands.moveTrain) {;
      moveTrain(commands.moveTrain.trainSelected);
    }
    if (commands.setFunction) {
      trainFunction(commands);
    }

    if (commands.requestStatus) {
      dccComm.sendCommand(commands);
    }
    if (commands.power) {
      dccComm.sendCommand(commands);
    }
  }

  function _handleTrainSelection (message) {
    console.log('train selection made', message);
    selectTrain (message.trainSelected);
  }



  function _handleClientClosed(client) {
    console.log('client closed ', client)
    // TODO
    // enssure train comes to a complete stop
    // we may find that we do not need all the train data on the apiModel.trainsInUse
    // perhaps we only need the train id and the client id

    // remove the train from in use
    const activeClients = [];
    wss.clients.forEach(function (client) {
      activeClients.push(client.raspberryTrainData.clientId);
    });

    removeTrainInUse(activeClients, 'clientId', true);

  }

  function _handleMessages(data){
    console.log("wss received a message ",data);
    try {
        const _message = JSON.parse(data);

        // send directly to the STATION CONTROL
        if (_message.adminCommands) {
          dccComm.sendCommand(_message);
        }

        // send train command to STATION CONTROL
        if (_message.trainCommands) {
          _handleTrainCommands(_message);
        } 
        
        // train selection / train decomission
        else if (_message.trainSelected) {
          _handleTrainSelection(_message);
        }
        
        // communicate to the clients
        else if (_message.sendTo) {
          wss.sendTo(_message);
        } else {
            wss.broadcast(data);
        }
      }catch(e){
        console.error("message is not json format or parsing went wrong ",data,e);
      }
  }
}

module.exports = { init }