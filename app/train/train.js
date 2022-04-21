
/**
 * This is used as a view controller
 * The api is responsible for controlling specific instances of trains in use
 * The api will pass in configurations
 * This module will pass back the structure it expects to use
 * The api will use the model to pass back view models to update the html
 * The api will use the model to pass back control models to update the dcc controls
 */
import html from 'snabby/snabby';
import mainView from './train-init-main-view.js';
import trainView from './train-view.js';
import emergencyControl from './train-control-emergency.js';

let _trainData;
let _configs;

function update () {
  _configs.trainView = html.update(_configs.trainView, view(_trainData));
  trainView.paintTrainBody(_trainData.trainSelected);
}

const init = (configs) => {
  // api is responsible for tracking trains in use and real time data changes
  _configs = mainView.init(configs);
  _configs.trainApi.connectToTrainApi(handleIncomingMessage);
};

function buildTrainControls (viewModel) {

  const _parkTrain = (viewModel) => {
    _configs.trainApi.handleSendingMessage({
      trainCommands: {
        parkTrain: viewModel
      }
    });

    // reset selection colors
    // they were colored to match the selected train
    trainView.paintSelectorControl(viewModel);
  }

  const _changeSpeed = (ev, viewModel) => {
    viewModel.trainSelected.speed = ev.target.value;
    _configs.trainApi.handleSendingMessage({
      trainCommands: {
        moveTrain: viewModel
      }
    });
    update();
  };
  const _changeDirection = (viewModel) => {
    viewModel.trainSelected.directionForward = !viewModel.trainSelected.directionForward;
    _configs.trainApi.handleSendingMessage({
      trainCommands: {
        moveTrain: viewModel
      }
    });
    update();
  }

  const _toggleLights = (viewModel) => {
    viewModel.trainSelected.lightsOn = !viewModel.trainSelected.lightsOn;
    _configs.trainApi.handleSendingMessage({
      trainCommands: {
        setFunction: 'lights',
        train: viewModel
      }
    });
    update();
  };

  const disableControl = viewModel.isEmergency || !viewModel.trainSelected;
  const direction = !viewModel.trainSelected ? 'forward' : viewModel.trainSelected.directionForward ? 'forward' : 'reverse';
  const lightsOn = !viewModel.trainSelected ? false : viewModel.trainSelected.lightsOn;
  return html`<div id="raspberry-train-controls">
    <div class="train-control-group">
      <div class="train-control button-container">
        <button class="button-normal icon park-train"
          @on:click=${viewModel.trainSelected ? () => _parkTrain(viewModel) : () => trainView.expandSelection(viewModel, update)}
          @class:disabled=${viewModel.isEmergency}
          @attrs:disabled=${viewModel.isEmergency}>
        </button>
        <div class="control-text"> ${viewModel.trainSelected ? 'Park Train' : 'Select Train'}</div>
      </div>
      ${emergencyControl.buildEmergencyControl(update, emergencySendSignal, disableControl)}
      <div class="train-control button-container" >
        <button class="button-normal icon direction-${direction}"
          @class:disabled=${disableControl}
          @on:click=${() => _changeDirection(viewModel)}
          @attrs:disabled=${disableControl}>
        </button>
        <div class="control-text">${!viewModel.trainSelected ? 'Waiting' : viewModel.trainSelected.directionForward ? 'Forward' : 'Reverse'}</div>
      </div>
    </div>
    <div class="train-control-group--control-speed">
      <div class="train-control speed-selection-container" >
        <div class="control-text">Train Speed</div>
        <input class="speed-selector" type="range" min="0" max="126" value="0"
          @class:disabled=${disableControl}
          @attrs:disabled=${disableControl}
          @on:input=${(ev) => _changeSpeed(ev, viewModel)}>
        <div class="control-text">${viewModel.trainSelected ? viewModel.trainSelected.speed : 0}%</div>
      </div>
    </div>
    <div class="train-control-group">
      <button class="button-normal icon lights-${lightsOn}"
        @class:disabled=${disableControl}
        @on:click=${() => _toggleLights(viewModel)}
        @attrs:disabled=${disableControl}>
      </button>
      <div class="control-text">${!viewModel.trainSelected ? 'Select Train' : viewModel.trainSelected.lightsOn ? 'Lights On' : 'Lights Off'}</div>
    </div>
  </div>`
}
const view = (viewModel) => {
  // standard view 2 columns
  // train controls | train selection
  // small view 1 column
  // train selection
  // train controls
  return html`<div id="raspberry-train-container">
      ${emergencyControl.buildEmergencyWarning(viewModel)}
      ${viewModel ? buildTrainControls(viewModel) : 'no data yet'}
      <div id="raspberry-train-selection">
        ${buildTrainSelection(viewModel)}
        ${viewModel ? trainView.view(viewModel) : 'no data yet'}
      </div>
    </div>`;
};

const destroy = () => {

};

function buildTrainSelection (viewModel) {
    const _selectTrain = (trainId) => {
      // close the selection
      trainView.expandSelection(viewModel, update);
      if (trainId) {
        _configs.trainApi.handleSendingMessage({
          trainSelected: {
            clientId: _trainData.clientId,
            trainId: trainId
          }
        });
      } else {
        update();
      }
    };

    return trainView.buildTrainSelection(viewModel, _selectTrain, update);
}

function emergencySendSignal () {
  _trainData.isEmergency = true;
  _configs.trainApi.handleSendingMessage({
    trainCommands: {
      emergency: _trainData
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
