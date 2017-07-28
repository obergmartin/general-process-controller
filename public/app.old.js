
var deviceFunctionsInput = {
  "DHT": [
    "getHumid",
    "getTempC",
    "getTempF"
  ],
  "DS": [
    "getTempC",
    "getTempF"
  ],
  "relayexp": [
    "isOn",
    "isOff",
    "getMinutesOn",
    "getMinutesOff"
  ],
  "gpio": [
    "getStatus",
    "isOn",
    "isOff",
    "getMinutesOn",
    "getMinutesOff"
  ],
  "Timer": [
    "getTimeStamp",
    "getTime24"
  ]
};


var deviceFunctionsOutput = {
  "relayexp": [
    "setRelayOn",
    "setRelayOff"
  ],
  "gpio": [
    "setRelayOn",
    "setRelayOff",
    "ignoreLastInput"
  ],
  "DS": [
    " "
  ],
  "DHT": [
    " "
  ],
  "Timer": [
    " "
  ]
};


var host = window.document.location.host.replace(/:.*/, '');
var ws = new WebSocket('ws://' + host + ':8080');

ws.onmessage = function (event) {
  var mess = JSON.parse(event.data);

  // for devices.html
  //console.log(mess['dataLog']);
  if (mess.hasOwnProperty('dslist')) {
    data = mess['dslist'];
    //console.log(data);
    update_ds(data);
  }
  
  // for status.js
  else if (mess.hasOwnProperty('dataLog')) {
    data = mess['dataLog'];
    //console.log(data);
    plot_it();
  }
};

//var msg = {"getLog": getfile};
//console.log(msg);
//ws.send(JSON.stringify(msg));

