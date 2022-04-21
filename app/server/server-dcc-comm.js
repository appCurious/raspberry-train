// // const gpio = require('onoff').Gpio; not needed we will use usb serial instead of io pins :)
// import SerialPort from 'serialport';
// import Readline from '@serialport/parser-readline';
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const osPorts = {
  'win': 'COM3',
  'linux': '/dev/ttyACM0'
};

let isPortActive = true;
let port, parser;
function beginComms () {
  const opSys = process.platform;
  console.log('you are on opSys ', opSys)
  let serialAddress = opSys.includes('win') ? osPorts.win : opSys.includes('linux') ?  osPorts.linux : '';


  try {
    // TODO extract config: baudrate 
    port = new SerialPort(serialAddress, { baudRate: 115200 }, (err) => {
      console.log('swallow the error ', err);
    } ); // match arduino baudrate
    parser = port.pipe(new Readline( {delimiter: '>' } ));
  } catch (oopsie) {
    console.warn('Dcc Dispatch Communication Connection Failed: ',oopsie);
    isPortActive = false;
  }


  // DCC Controller Communication //
  port.on('open',  () => {
    console.log('Dcc Dispatch Communication Open');
    // sendCommand({powerOn: true}); //it's not quite listening yet
  });

  parser.on('data', data => {
    // will probably have to buffer this and read it
    // probably only exceptions would be communicated?  
    // maybe for Admin Controller it could have stats and switch status
    // train positions on the track
    // signals...all sorts of comms  :)
    console.log('parser Dcc Dispatch incoming message \n ',data);
  });


}

function sendCommand (data) {
  console.log( 'data to send to Dcc Dispatch ', data)
  // delimeter is a newline that tells the dcc controller message complete
  // const message = `${JSON.stringify(data)}\n`
  const message = encodeMessageForDispatch(data);
  console.log('message to send to Dcc Dispatch ', message);
  if (isPortActive) {
    port.write(message, (err) => {
      if (err) {
        // communicate error back to user raspberryTrain.userId
        return console.error('oopsie - failed to send data to Dcc Dispatch');
      }
      console.log('sent message to Dcc Dispatch');
    });
  }

}

function receiveResponse (data) {
  // data came from DCC Controller Arduino
  console.log('response from Dcc Dispatch ',data);
}

// EXTRACT THIS TO API - DCCPP (DccPlusPlus)
// https://github.com/DccPlusPlus/BaseStation/wiki/Commands-for-DCCpp-BaseStation
// https://github.com/DccPlusPlus/BaseStation/blob/master/DCC%2B%2B%20Arduino%20Sketch.pdf
const commandMap = {
  'Train': 't',
  'TrainFunction': 'f',
  'status': 's',
  'statusD': 'D'

  

};

function encodeMessageForDispatch(data) {
  console.log('waht did we get to encode', data)

  if (data.adminCommands) {
    console.log('we got admin command ', data.adminCommands.command)
    return data.adminCommands.command || '';
  }

  // power controls
  if (data.power) {
    return data.power.powerOn ? '<1>' : '<0>';
  }

  // diagnostic controls
  if (data.requestStatus) {
    const status = commandMap[data.requestStatus];
    if (!status) {
      console.warn('status is not understood: ', data.requestStatus);
      return '<>';
    }
    return  `<${status}>`;
  }

  // interactive controls
  // cabs | switches | equipment
  const command = commandMap[data.control.controlType];
  if (!command) {
    console.warn('command is not found: ', command);
    return '<>';
  }
  let encodedMessage;

  switch (command) {
    case 't':
      encodedMessage = `<t1 ${data.control.dccId} ${data.control.speed} ${data.control.directionForward ? 1 : 0}>`;
      break;
    case 'f':
      // need to map functions to the corresponding numeric logic
      // f0-f4 128
      // lights on 144
      // all off is 128
      // f5-f8 176
      // https://github.com/DCC-EX/WebThrottle-EX/blob/a2c23fbf105c89030723d6667b08c53eed36e9f5/js/commandController.js#L233
      encodedMessage = `<f ${data.control.dccId} ${data.control.active ? '144' : '128'} >`;
      break;
    default: 
      console.warn(`command is not understood: ${comand}`)
      encodedMessage = '<>'; 
      break;
  }

  return encodedMessage;
}

beginComms();

module.exports = {sendCommand, receiveResponse };




