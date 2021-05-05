import html from 'snabby.js';
import getSvgDocument from '../lib/get-svg-doc.js';

const init = (config) => {

};

const view = (viewModel) => {
  return html`
    <div id="train-container">
      <object id="train-container--train" data="assets/Plain_Cowl_Locomotive.svg" type="image/svg+xml"></object>
    </div>`;
};

const expandSelection = (viewModel, update) => {
  viewModel.expandTrainSelection = !viewModel.expandTrainSelection;
  paintTrainSelections(viewModel.selectionsAvailable);
  update();
};

const buildTrainSelection = (viewModel, selectionMadeFn, update) => {
  const options = [];

  if (viewModel.trainSelected) {
    options.push(html`<div class="select-train-option selected">
        ${viewModel.trainSelected.displayName}
      </div>`);
  } else {
    viewModel.selectionsAvailable.reduce((acc, train) => {
      acc.push(html`
        <div class="select-train-option"
          @style:visibility="${viewModel.expandTrainSelection ? 'visible' : 'hidden'}"
          @on:click=${() => paintSelectorControl(viewModel, train.id, selectionMadeFn)}>
          <div class="control-text">${train.displayName}</div>
          <object id="train-selection--${train.id}" class="select-train-icon" 
            data="assets/Plain_${getTrainBody(train)}.svg" type="image/svg+xml">
          </object>
        </div> 
      `);

      return acc;
    },options);

    options.unshift(html`<div class="select-train-option default"
      @on:click=${() => expandSelection(viewModel, update)}>
        ${options.length ? '-- Selection a Train --' : '!! No Trains Available !!'}
      </div>`);
  }
 
  const expandedHeight = (100 * options.length) + 20;

  return html`<div class="select-container">
      <div class="select-train"
        @class:expanded="${viewModel.expandTrainSelection}">
        <div class=select-train-options-container
          @style:height="${viewModel.expandTrainSelection ? expandedHeight + 'px' : ''}">
          ${options}
        </div>
      </div>
    </div>
  `;
}

const getTrainBody = (train) => {
  return `${train.bodyType}_${ train.type === 'diesel-electric' ? 'Locomotive' : 'SteamEngine'}`;
}

const paintTrainBody = (train) => {
  const svgDoc = getSvgDocument('#train-container--train');

  if (svgDoc == null) return;

  paintTrain(svgDoc, train);
};

const paintTrainSelections = (selectionsAvailable) => {
    selectionsAvailable.forEach((train) => {
      const svgDoc = getSvgDocument(`#train-selection--${train.id}`);

      if (svgDoc == null) return;
      
      paintTrain(svgDoc, train)
    });
};

const paintSelectorControl = (viewModel, trainId, selectionMadeFn) => {  

  const trainSelector = document.querySelector('#raspberry-train-selection .select-container .select-train .select-train-options-container');

  const colors = viewModel.selectionsAvailable.reduce((colors, train) => {
    if (train.id === trainId) {
      colors.background = train.mainColor;
      colors.color = train.secondColor;
    }

    return colors;

  }, {background: '', color: ''} );

  trainSelector.style.color = colors.color; // || trainSelector.style.color;
  trainSelector.style['background-color'] = colors.background; // || trainSelector.style.background-color; 

  if (selectionMadeFn) { selectionMadeFn(trainId); }
}

function paintTrain (svgDoc, train) {
  const mainColor = train ? train.mainColor : '';
  const secondColor = train ? train.secondColor : '';
  const opacity = train ? 1 : 0.5;

  const mainColorComponents = svgDoc.querySelectorAll('*[id^="maincolor"]');
  const secondColorComponents = svgDoc.querySelectorAll('*[id^="secondcolor"]');

  mainColorComponents.forEach((item) => { setTrainColorScheme(item, mainColor, opacity); });
  secondColorComponents.forEach((item) => { setTrainColorScheme(item, secondColor, opacity); });
}

function setTrainColorScheme (elem, color, opacity) {
  elem.style.fill = color || elem.style.fill;
  elem.style.opacity = opacity;
}



export default { 
  init,
  view,
  getTrainBody,
  paintTrainBody,
  paintTrainSelections,
  buildTrainSelection,
  expandSelection,
  paintSelectorControl
};
