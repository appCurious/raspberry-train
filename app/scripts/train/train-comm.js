// TODO - use a config file for connection string

const _socketAddress = 'ws://localhost:55555'; // request from server
let _trainApi;

const connectToTrainApi = (handleMessage) =>{
  _trainApi = new WebSocket(_socketAddress,['soap','xmpp','json']);
  _trainApi.onopen = function(){ if(_trainApi.readState ===1){console.log("we are connected");}};
  _trainApi.onmessage = handleMessage;
  _trainApi.onerror = function(e){
    console.log("host error");
    handleMessage({hostError: e});
  };
  _trainApi.onclose = function(){
    console.log("host closed");
    handleMessage({hostClosed: 'host closed'})
  };
}

const handleSendingMessage = (message) => {
  _trainApi.send(JSON.stringify(message));
}

export default { connectToTrainApi, handleSendingMessage };