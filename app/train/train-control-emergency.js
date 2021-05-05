import html from 'snabby.js';
import getSvgDocument from '../lib/get-svg-doc.js';

let emergencyTimer;
let _configs;

const init = (configs) => {
  _configs = configs;
};

const buildEmergencyControl = (update, sendEmergencySignalFn, disableControl) => {

    return html`<div class="train-control button-container">
    <div class="emergency-control-container">
      <div class="control-text">EMERGENCY</div>
      <button class="icon button-emergency"
        @class:disabled=${disableControl}
        @on:click=${() => emergency(update, sendEmergencySignalFn) }
        @attrs:disabled=${disableControl}>
      </button>
      <div class="control-text">EMERGENCY</div>
    </div>
  </div>`;
};

const buildEmergencyWarning = (viewModel) => {
  return html`<object id="emergency-button-image"
        @style:display=${!viewModel.isEmergency ? 'none' : ''}
        class="button-image" 
        data="assets/Plain_Estop.svg" 
        type="image/svg+xml">
      </object>`;
};

const clearEmergency = () => {
  clearInterval(emergencyTimer);
};

function emergency (update, sendServerMessage) {
  if (typeof sendServerMessage === 'function') sendServerMessage();
  clearEmergency();
  emergencyTimer = setInterval(() => pulseEmergencyWarning(update), 750);
  update();
 
}
function pulseEmergencyWarning (update) {
  const svgDoc = getSvgDocument('#emergency-button-image');
  
  if (svgDoc == null) return;

  const warningComponent = svgDoc.querySelectorAll('*[id^="e-stop-warning"]');
  const size = warningComponent[0].style.r ? parseFloat(warningComponent[0].style.r) : warningComponent[0].r.baseVal.value;

  const maxSize = warningComponent[0].r.baseVal.value;
  const minSize = warningComponent[0].r.baseVal.value * .5;


  const _resizeEmergencyWarning = (size, n) => {
    const newSize = size + n;
    warningComponent[0].style.r = (newSize);
  }

  if ( size >= minSize) {
      _resizeEmergencyWarning(size, -5);
  } else if ( size <= maxSize ) {
      _resizeEmergencyWarning(size, 5);
  }
  update();
}

// TODO standardize export
// any control is to have a buildControl method --> rename buildEmergencyControl
// { buildControl, buildControlOutputDisplay, activate, deactivate}
export default { buildEmergencyControl, buildEmergencyWarning, clearEmergency, emergency };