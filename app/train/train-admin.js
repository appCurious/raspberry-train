import html from 'snabby/snabby';
import mainView from './train-init-main-view.js';
import emergencyControl from './train-control-emergency.js';

let _trainData;
let _configs;

function update () {
  _configs.trainView = html.update(_configs.trainView, view(_trainData));
}

const init = (configs) => {
  // api is responsible for tracking trains in use and real time data changes
  _configs = mainView.init(configs);
  _configs.trainApi.connectToTrainApi(handleIncomingMessage);
};

const view = (viewModel) => {
  // TODO 
  // display all trains in use
  // display available selections
  // monitor train speeds
  // monitor train directions
  // monitor client ids

  // TODO Longterm - 
  // monitor switch tracks
  // monitor switch track clients ( operators )

  /**
   *  ${viewModel ? buildTrainControls(viewModel) : 'no data yet'}
      <div id="raspberry-train-selection">
        ${buildTrainSelection(viewModel)}
        ${viewModel ? buildTrainView() : 'no data yet'}
      </div>
   */

  return html`<div id="raspberry-train-container">
      ${emergencyControl.buildEmergencyWarning(viewModel)}
      ${viewModel ? buildTrainControls(viewModel) : 'no data yet'}
      <div class="train-control-group">
        <div class="train-control button-container">
          <input type="button"
            @on:click=${() => getDiagnostics('status')} value="Get Status" />
          <div class="control-text"> Get Status</div>
        </div>
        <div class="train-control button-container">
          <input type="button"
            @on:click=${() => getDiagnostics('statusD')} value="Get Diagnostics" />
          <div class="control-text">Get Diagnostics</div>
        </div>
        <div class="train-control button-container">
          <input id="send-command" type="text" placeholder ="send command"/>
          <input type="button"
            @on:click=${() => sendCommand()} value="Get Diagnostics" />
          <div class="control-text">Send Command</div>
        </div>
      </div>
      <div class="train-control-group">
        <div class="train-control button-container">
          <input type="button"
            @on:click=${() => power(true)} value="Power On" />
          <div class="control-text">Power On</div>
        </div>
        <div class="train-control button-container">
          <input type="button"
            @on:click=${() => power(false)} value="Power Off" />
          <div class="control-text">Power Off</div>
        </div>
      
      </div>
    </div>`;
};

const destroy = () => {

};

function buildTrainControls (viewModel) {

  const emergencySignalFn = !viewModel.isEmergency ? emergencySendSignal : emergencyAllClear;

  return html`<div id="raspberry-train-controls">
    <div class="train-control-group">
      ${emergencyControl.buildEmergencyControl(update, emergencySignalFn, false)}
    </div>
  </div>`
}

function emergencySendSignal () {
  _trainData.isEmergency = true;
  _configs.trainApi.handleSendingMessage({
    trainCommands: {
      emergency: _trainData
    }
  });
}

function emergencyAllClear () {
  _configs.trainApi.handleSendingMessage({
    trainCommands: {
      allClear: _trainData
    }
  });
}
function sendCommand () {
  const commandElement = document.querySelector('#send-command');
  console.log('comand to send ', commandElement.value);
  _configs.trainApi.handleSendingMessage({
    adminCommands: {
      command: commandElement.value
    }
  });
}

function getDiagnostics (diag) {
  _configs.trainApi.handleSendingMessage({
    trainCommands: {
      requestStatus: diag
    }
  });
}

function power (on) {
  _configs.trainApi.handleSendingMessage({
    trainCommands: {
      power: {powerOn:on}
    }
  });
}

function handleIncomingMessage (message) {
  if (message.data) {
    let data;
    
    try {
      data = JSON.parse(message.data);
      console.log('we got message data ', data)
    } catch (e) {
      console.error('RASBERRY TRAIN !!!  could not read message from STATION CONTROL we better do something ', e);
    }
    
    if (data.isEmergency) {
      _trainData.isEmergency = true;
      emergencyControl.emergency(update);
    }

    if (data.clearEmergency) {
      emergencyControl.clearEmergency();
    }

    if ( data.error) {
      console.error('RASBERRY TRAIN !!!  is off the rails we better do something ', data.info);
    }

    if (data.raspberryTrainData) {
      _trainData = data.raspberryTrainData;
      if (_trainData.isEmergency) {
        emergencyControl.emergency(update);
      } else {
        update();
      }
    }
   
    if (data.selectionsAvailable) {
      _trainData.selectionsAvailable = data.selectionsAvailable;
      update();
    }
  }
  
}

export default { init, destroy };