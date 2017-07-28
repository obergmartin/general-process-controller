var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var fs = require('fs');
var ChildProcess = require('child_process');
var app = express();
var server = require('http').createServer();

const Agent = require('./agent');
const AdjTimeout = require('./adjto');

var base_dir = './';
var json_dir = './public/';

var ConvertCSV = function(f) {
  // Data are saved in CSV format space efficiency and for easy appending of 
  // new values.  A request for a CSV data file will open one and convert it 
  // to Json.
  
  var lines = f.split('\n');
  var names = lines[0].split(',');
  var dat = {};
  for (var j = 0; j < names.length; j++){
    dat[names[j]] = [];
  }
  
  for (var i = 1; i < lines.length; i++) {
    if (lines[i].length > 0) {
      var vals = lines[i].split(','); 
      for (var j=0; j<names.length; j++) {
        var cur = vals[j];
        if (cur === '') {
          cur = dat[names[dat.length-1]];
        }
        dat[names[j]].push(cur);
      }
    }
  }
  //var sdat = 'data = ' + JSON.stringify(dat);
  //return sdat;
  return dat;
};


var GenLogList = function() {
  // Generates a list of of log files based on filenames that have a date format
  // e.g. 2017-01-01.csv
  // This list is used to populate a dropdown menu in loghistory.html
  //var f = fs.readdirSync(this.base_dir+'data/');
  var f = fs.readdirSync(base_dir+'data/');
  f = f.filter(function(i) { return /^\d{4}-\d{2}-\d{2}/.test(i); });
  //console.log(f);
  //return JSON.stringify({"loglist": f});
  return f;
};



// setup server
app.use(express.static(path.join(__dirname, '/public')));
var mes;

// setup agent
//var a = new Agent(json_dir+'init.json');

var wss = new WebSocketServer({server: server});
wss.agent = new Agent(json_dir+'init.json');
//wss.agent.setup();

wss.on('connection', function (ws) {
  var id = setInterval(function () {
    //something periodic
    //ws.send(JSON.stringify(process.memoryUsage()), function () { /* ignore errors */ });
  }, 100);
  console.log('started client interval');
  
  ws.on('message', function incomming(message) {
    try {
      // convert to JSON if possible
      message = JSON.parse(message);
    } 
    catch(e) {
    }
    
    //console.log(message);
    wss.m = message;
    var toSend = {};

    if (message.hasOwnProperty("getDevStatus")) {
      //console.log(message);
      // do stuff
      var cur_dev = message['getDevStatus']; // the device to lookup
      var deviceStatus = {};
      deviceStatus[cur_dev] = wss.agent.dev[cur_dev]['getStatus']();
      //toSend[cur_dev] = deviceStatus;
      //toSend['devStatus'] = {};
      toSend['devStatus'] = deviceStatus;
      console.log('devStatus', cur_dev, deviceStatus);
      console.log(toSend);
      ws.send(JSON.stringify(toSend), function () { /* ignore errors */ });
    }
    else if (message.hasOwnProperty('doAction')) {
      var cur_dev = message['doAction'][0];
      var cur_fn = message['doAction'][1];
      wss.agent.dev[cur_dev].Override = 1;
      
      console.log('doAction', cur_dev, cur_fn);
      wss.agent.dev[cur_dev][cur_fn]();
      
      toSend['dev_status'] = {};
      toSend['dev_status'][cur_dev] = wss.agent.dev[cur_dev]['getStatus']();
      //console.log('getStatus', cur_dev, deviceStatus);
      ws.send(JSON.stringify(toSend), function () { /* ignore errors */ });
    }
    else if (message.hasOwnProperty('resetOverride')) {
      var cur_dev = message['resetOverride'];
      wss.agent.dev[cur_dev].Override = 0;
    }
    else if (message.hasOwnProperty('getFile')) {
      var fn = json_dir + message['getFile'];
      console.log(fn);
      fs.readFile(fn, 'utf-8', function(error,data){
        //console.log(request.url);
        if (error) {
          //ws.send('error?');?
        } else {
          //toSend = data;
          ws.send(data);
        }
      });
    }
    else if (message.hasOwnProperty('getLog')) {
      var fileName = message['getLog'];
      var fn = base_dir+'data/'+fileName;
      console.log(fn);
      fs.readFile(fn, 'utf-8', function(error,data){
        //console.log(request.url);
        if (error) {
          //ws.send('error?');?
        } else {
          toSend['dataLog'] = ConvertCSV(data);
          ws.send(JSON.stringify(toSend));
        }
      });
    }
    else if (message.hasOwnProperty('saveData')) {
      var curFile = message['saveData']['File'];
      var curDat = message['saveData']['Data'];
      fs.writeFile(json_dir + curFile, JSON.stringify(curDat, null, ' '), 'utf8');
    }
    else if (message === 'getDSlist') {
      var cmd = 'cat /sys/devices/w1_bus_master1/w1_master_slaves';
      var r = ChildProcess.execSync(cmd).toString().trim().split('\n');
      var tosend = {"dslist": r};
      console.log(tosend);
      ws.send(JSON.stringify(tosend));
    }
    else if (message === 'getLogList') {
      var toSend = {};
      toSend.logList = GenLogList();
      console.log(toSend);
      ws.send(JSON.stringify(toSend));
    }
  });
  
  ws.on('close', function () {
    console.log('stopping client interval');
    clearInterval(id);
  });
});

server.on('request', app);
server.listen(8080, function () {
  console.log('Listening on http://localhost:8080');
});

var mainLoop = function() {
    wss.agent.setup();
    wss.agent.updateVals();
    wss.agent.updateActs();
    wss.agent.logData();
};

var doError = function() {
    console.warn('The drift exceeded the interval.');
};

var schedule = new AdjTimeout(mainLoop, 60000, doError);
schedule.start();
//module.exports = wss;
