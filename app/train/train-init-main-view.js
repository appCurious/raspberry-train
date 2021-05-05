import { default as trainApi } from './train-comm.js';

const init = (configs) => {
  configs = configs || {};
  configs.elem = document.querySelector(configs.elementSelector);

  // create the app container
  if (!configs.elem) {
    configs.elementSelector = 'raspberry-train-wrapper'
    const raspberryTrainWrapper = document.createElement('div');
    raspberryTrainWrapper.id = configs.elementSelector;
    configs.elem = raspberryTrainWrapper;
    document.body.append(raspberryTrainWrapper);
  }

  const trainView = document.createElement('div');
  trainView.id = 'raspberry-train-container';
  configs.elem.appendChild(trainView);

  configs.trainView = trainView;
  configs.trainApi = trainApi;

  return configs;
};

export default { init };
