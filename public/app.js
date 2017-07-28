
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
    "getTime24",
    "getDawn",
    "getDusk",
    "getSunrise",
    "getSunset"
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


var evalFunctions = [
  "const",
  "gt",
  "gte",
  "lt",
  "lte",
  "eq",
  "and",
  "or",
  "not",
  "add",
  "sub",
  "diff"
];

var tdWithP = function(txt) {
  var content = document.createElement("p");
  content.innerHTML = txt;
  var new_cell = document.createElement('td');
  new_cell.appendChild(content);
  return new_cell;
};

function makeTextRow(itemList) {
  var new_row = document.createElement('tr');
  
  for (var i = 0; i < itemList.length; i++) {
    new_row.appendChild(tdWithP(itemList[i]));
  }
  
  return new_row;
}


var host = window.document.location.host.replace(/:.*/, '');
var ws = new WebSocket('ws://' + host + ':8080');

ws.onmessage = function (event) {
  var mess = JSON.parse(event.data);
  //console.log(mess);

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
  
  // for manual.html
  else if (mess.hasOwnProperty('devStatus')) {
    data = mess['devStatus'];
    //console.log(data);
    //var stats = JSON.parse(event.data);
    //console.log('onmessage', stats);
    updateStats(data);
  }
};

//var msg = {"getLog": getfile};
//console.log(msg);
//ws.send(JSON.stringify(msg));





