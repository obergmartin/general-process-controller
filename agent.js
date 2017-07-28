'use strict';

const os = require('os');
const fs = require('fs');
const DS = require('./ds');
const DHT = require('./dht22');
const Gpio = require('./pinio');
const Timer = require('./timer');

if (os.arch() === 'mipsel') {
  // relay expansion board is only compatable with Omega boards
  const RelayExp = require('./relayexp');
}

var base_dir = './';
var json_dir = './public/';

var funs = {};
funs.eq =  function(a,b){ return a == b; };
funs.gt =  function(a,b){ return a > b; };
funs.lt =  function(a,b){ return a < b; };
funs.gte = function(a,b){ return a >= b; };
funs.lte = function(a,b){ return a <= b; };
funs.and = function(a,b){ return a && b; };
funs.or =  function(a,b){ return a || b; };
funs.add = function(a,b){ return a + b; };
funs.sub = function(a,b){ return a - b; };
funs.diff= function(a,b){ return a - b < 0 ? b - a : a - b; };
funs.not = function(a)  { return !a; };

var ArraysAreEqual = function(a, b) {
  if (a.length != b.length) { 
    return false;
  }

  for (var i=0; i<a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  
  return true;
};


function Agent(initf) {
  this.verbose = false;
  this.initFile = initf;
  this.ini = {};
  this.dev = [];
  this.ob = [];
  this.fn = [];
  this.inputVals = {};
  this.logVars = [];
  this.inputFn = [];
  this.tasks = [];
}

Agent.prototype.makeFn = function(){
	var pad = function(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    };
    var d = new Date();
    
    //return d.toISOString().substr(0,10)+".csv";
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'.csv';
};

Agent.prototype.evalFn = function (fn, astr, bstr) {
    // lookup value for "a" or use constant
    var a = (this.inputVals.hasOwnProperty(astr))
      ? this.inputVals[astr]
      : + astr;
    // if constant, return it.
    if (fn === 'const') { 
      return(a);
    }
    // if function takes one value, compute and return
    else if (fn === "not") {
      return(funs[fn](a));
    }
    // lookup value for "b" or use constant
    var b = (this.inputVals.hasOwnProperty(bstr))
      ? this.inputVals[bstr]
      : + bstr;
    // compute and return
    return(funs[fn](a, b));
}
  
Agent.prototype.updateVals = function() {
  // InputValues can be: 
  //   Constants: "Name": n, "Const": c
  //   the output of Device functions: "Name": n, "Device": d, "fn", f
  //   result of an Evaluation: "Name": n, "Eval": e
  
  if (this.verbose) {
    console.log('\nUpdating inputValues:');
  }
 
  for (var i=0; i<this.InputValFn.length; i++) {
  	var cur = this.InputValFn[i];
  	console.log('updateVals', cur);
    
    if ('Device' in cur) {
      //console.log(cur);
      // "Device": dv, "fn": fn
      if (cur.Device === 'const') {
      	this.inputVals[cur.Name] = cur.fn;
      } else {
        this.inputVals[cur.Name] = this.dev[cur.Device][cur.fn]();
      }
    }
  }
  
  
  for (var i = 0; i < this.Evals.length; i++) {
    //if ('Eval' in cur) {
      
    // "Eval": [fn, a, b]
    var cur = this.Evals[i];
    console.log(cur);
    this.inputVals[cur.Name] = this.evalFn(cur["Function"], cur["a"], cur["b"]);

    if (this.verbose) {
      console.log(cur, this.inputVals[cur.Name]);
    }
  }
};


Agent.prototype.updateActs = function() {
  // An action is specified by a function of an object.
  // The Action is executed if the specified InputValue (ie Trigger) is true.
  // "Actions": {"Trigger": t, "Object": o, "fn": f}

  if (this.verbose) {
    console.log('\nupdateActions:');
  }

  for (var i = 0; i < this.Actions.length; i++) {
    var cur_act = this.Actions[i];
    console.log('updateActs', cur_act);
    
    if (!cur_act.Override){
        // == allows for 1 to evaluate as true
        var isTrue = (this.inputVals[cur_act.Trigger] == true);

        if (isTrue === true) {
          if (this.verbose) {
            console.log(cur_act.Trigger, isTrue, ':', cur_act.Device, cur_act.fn);
          }
          this.dev[cur_act.Device][cur_act.fn]();
        } else {
          if (this.verbose) {
            console.log(cur_act.Trigger, isTrue);
          }
        }
      }
  }
};


Agent.prototype.setup = function() {
  var obj = fs.readFileSync(this.initFile, 'utf-8');
  var devFile = fs.readFileSync(json_dir + 'devices.json', 'utf-8');
  this.ini = JSON.parse(obj).init;
  this.ini.Devices = JSON.parse(devFile).Devices;
  console.log(this.ini);
  
  if (this.verbose) {
    console.log('setup...');
  }
  
  for (var i=0; i<this.ini.Devices.length; i++) {
    var cur = this.ini.Devices[i];
    //console.log(i, cur);
    if (cur.Type === 'DS'){
      if (!(cur.Name in this.dev)){
        //var obj = new DS(cur.addr);
        this.dev[cur.Name] = new DS(cur.addr);
      }
    } 
    else if (cur.Type === 'gpio') {
  	  if  (!(cur.Name in this.dev)) {
        //var obj = new Gpio(cur.addr);
        this.dev[cur.Name] = new Gpio(cur.addr);
  	  }
    }
    else if ((cur.Type === 'relayexp') & (typeof RelayExp !== 'undefined')) { 
      if (!(cur.Name in this.dev)) {
      	var parm = cur.addr.split(',');
      	//var obj = new RelayExp(parm[0], parm[1]);
        //var obj = new RelayExp(cur.addr);
        this.dev[cur.Name] = new RelayExp(+parm[0], +parm[1]);
      }
    }
    else if (cur.Type === 'Timer'){ 
      if (!(cur.Name in this.dev)) {
        //var obj = new MyClock();
        var addr_ = cur.addr.split(',');
        var lat = addr_[0];
        var lon = addr_[1];
        this.dev[cur.Name] = new Timer(lat, lon);
      }
      //console.log(obj);
    }
    else if (cur.Type === 'DHT'){
      // if name not in list of this.dev, then add it
      if (!(cur.Name in this.dev)){
        this.dev[cur.Name] = new DHT(cur.addr);
        this.dev[cur.Name].readSensor();
      }
      // else update values
      else {
        this.dev[cur.Name].readSensor();
      }
    }

  //this.dev[cur.Name] = obj;
  }
  console.log('setup', this.dev);
  
  this.InputValFn = this.ini.InputVals;
  
  if (this.verbose) {
    console.log('Setup: devices');
    console.log(this.dev);
    console.log(this.dev.time.getTimeStamp());
    console.log(this.InputValFn);
  }
  
  //for (var i=0; i<this.ini.Evals.length; i++) {
  //    var cur = this.ini.Evals[i];
      //console.log(i, cur);
      //this.InputValFn.push({"Name":cur.Name, "Eval": cur.Eval});
  //    this.InputValFn.push({"Name":cur.Name, "Eval": cur.Eval});
  //}
  this.Evals = this.ini.Evals;
  
  if (this.verbose) {
    console.log('evals', this.InputValFn);
  }

  this.Actions = this.ini.Actions;
  
  // If there are variables to log make sure that the proper filename is set 
  // and that a new file is created (with a header) if necessary.
  //console.log('checking...');

  this.logfn = this.GetRecentLogFile();
  //console.log(this.logfn);


  //if (this.logfn == -1) {
  if (0){
    // no log file yet, make new one
    this.MakeFileName();
    this.logVars = this.ini.DataLog;
    this.WriteLogHeader();
  } 
  //else {
  if (0) {
    // log file(s) already exist. 
    // Has program just started?
    if (this.logVars.length === 0) {
      // program just starting.  Need to compare with existing file.
      var fh = fs.readFileSync('./data/' + this.logfn, 'utf-8').split('\n')[0];
      var prevVars = fh.split(',');
      if (!ArraysAreEqual(prevVars, this.ini.DataLog)) {
        this.logVars = this.ini.DataLog;
        this.IterFileName();
        this.WriteLogHeader();
      }
      this.logVars = this.ini.DataLog;
    }
    // Already running, have there been changes to the log vars?
    else if (!ArraysAreEqual(this.logVars, this.ini.DataLog)) {
      //this.logVars = this.ini.DataLog;
      //this.IterFileName();
      //this.WriteLogHeader();
      UpdateLogFile();
    }
  }
  
  // otherwise filename has already been set and header written.
  this.inputVals.date = this.makeFn().substr(0,10);
  
};

Agent.prototype.UpdateLogFile = function() {
  // log file header and current
}

Agent.prototype.GetRecentLogFile = function() {
  // returns most recent iteration of log file.  Assumes the user isn't renaming
  // files.
  var myclk = new Timer();
  var tdate = myclk.makeFn().split('.')[0];
  var rexp = new RegExp(tdate);
  var filt_fun = function(i) { return rexp.test(i); };
  var todays_files = fs.readdirSync('./data/').filter(filt_fun);
  if (this.verbose) {
    console.log(todays_files);
  }
  var file_n = todays_files.length;
  if (this.verbose) {
    console.log('getrecentfile: ', todays_files, file_n);
  }
  
  if (file_n === 0) {
    return -1;
  } else if (file_n == 1) {
    return myclk.makeFn();
  } else {
    return tdate + '_' + (file_n-1) + '.csv';
  }
};


Agent.prototype.WriteLogHeader = function() {
  var header = '';
  for (var i=0; i<this.logVars.length; i++) {
    header += this.logVars[i];
    if (i < this.logVars.length-1) { 
      header += ',';
    }
  }
  header += '\n';
  fs.appendFileSync('./data/' + this.logfn, header);
};


Agent.prototype.MakeFileName = function() {
    var myclk = new Timer();
    this.logfn = myclk.makeFn();
};




Agent.prototype.logData = function() {
    // IF needed, add columns to data file for extra variables
    // find out if there are extra columns in the current data.
    var datFile = fs.readFileSync('./data/' + this.logfn, 'utf-8').split('\n');
    var fh = datFile[0];
    var lastDatLine = datFile[datFile.length-1];
    var prevVars = fh.split(',');
    //console.log('total lines', datFile.length);
    //console.log('prev vars', prevVars);
    
    var remain = []; //this.logVars;
    // Go through this.logVars to see if new columns need to be added.
    //for (var i = 0; i < prevVars.length; i++) {
    for (var i = 0; i < this.logVars.length; i++) {
      var curVar = this.logVars[i];
      var ind = prevVars.indexOf(curVar);
      //if (!this.inputVals.hasOwnProperty(prevVars[i])) {
      if (ind === -1) {
        // if not in header, mark as needed
        remain.push(curVar);
        // also update header cols
        prevVars.push(curVar);
      }
    }
    console.log('remaining vars:', remain);
    
    var dat;
    // Add columns to data file
    var nRemain = remain.length;
    if (nRemain > 0) {
      for (var r = 0; r < datFile.length-1; r++) {
        if (r === 0) {
          // write new header
          dat = datFile[r] + ',' + remain.join(',') + '\n';
          //prevVars.push(
          //console.log('making new log file:', dat);
          fs.writeFileSync('./data/' + this.logfn, dat);
        }
        else if (r === 1) {
          // append old data + NaNs for new cols
          dat = datFile[r] + ',NaN'.repeat(nRemain) + '\n';
          fs.appendFileSync('./data/' + this.logfn, dat);
        }
        else {
          // append old data + '' for new cols
          dat = datFile[r] + ','.repeat(nRemain) + '\n';
          fs.appendFileSync('./data/' + this.logfn, dat);
        }
        //console.log('row', r);
        //console.log('dat', dat);
      }
    }

    // log file columns now match (or exceedes) new data to append    
    dat = '';
    for (var i = 0; i < prevVars.length; i++) {
        var curCol = prevVars[i];
        var ind = this.logVars.indexOf(curCol);
        //console.log('header col:', curCol);
        //console.log('cur val ind', ind);
        if (ind > -1) {
        //if (this.inputVals.hasOwnProperty(curCol)) {
            // There is a logVar for this data column, use it
            dat += this.inputVals[curCol];
        }
        else if (lastDatLine[i] === 'NaN') {
            // No logVar for this data column and last was NaN,
            // use empty column to save on file size.
            dat += '';
        }
        else {
            // No logVar for this data column, but there was previously
            // Mark as NaN
            dat += 'NaN';
        }
        if (i < prevVars.length-1) { 
            dat += ',';
        }
        //console.log('dat:', dat);
    }
    dat += '\n';
    
    //for (var i=0; i<this.logVars.length; i++) {
    //    // 'Time' is the only string variable
    //	var cur_val = (this.logVars[i] == 'Time' )
    //        ? this.inputVals[this.logVars[i]]
    //        : + this.inputVals[this.logVars[i]];
    //        //console.log(this.logVars[i], cur_val);
    //    dat += cur_val;
    //    if (i < this.logVars.length-1) { 
    //        dat += ',';
    //    }
    //}
    //dat += '\n';
    
    if (this.verbose) {
      console.log('./data/' + this.logfn);
    }
    fs.appendFileSync('./data/' + this.logfn, dat);
    
    // A file containing the most recent values is used for displaying.
    var dataWrite = 'recent = ' + JSON.stringify(this.inputVals, null, ' ');
    fs.writeFileSync(json_dir + 'recent.json', dataWrite);
};


Agent.prototype.plotData = function() {

};

Agent.prototype.start = function() {
  this.setup();
  this.updateVals();
  this.logData();
};


Agent.prototype.run = function() {
    this.setup();
    this.updateVals();
    this.updateActs();
    this.logData();
};

module.exports = Agent;


