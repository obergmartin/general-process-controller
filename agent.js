'use strict';

const os = require('os');
const fs = require('fs');
const DS = require('./ds');
const DHT = require('./dht22');
const Gpio = require('./pinio');
const MyClock = require('./myclock');

if (os.arch() === 'mipsel') {
  // relay expansion board is only compatable with Omega boards
  const RelayExp = require('./relayexp');
}

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
  	//console.log(cur);
    
    if ('Device' in cur) {
      //console.log(cur);
      // "Device": dv, "fn": fn
      if (cur.Device === 'const') {
      	this.inputVals[cur.Name] = cur.fn;
      } else {
        this.inputVals[cur.Name] = this.dev[cur.Device][cur.fn]();
      }
    } 
    else if ('Eval' in cur) {
      if (typeof cur.Eval === 'string') {
      	// "Eval": constant
      	this.inputVals[cur.Name] = + cur.Eval;
      }
      else {
        // "Eval": [fn, a, b]
        //console.log(cur);
        var fn = cur.Eval[0];
        // a, b can be an already computed value or a set constant
        // There should be some error checking here...
        var a = (cur.Eval[1] in this.inputVals) 
          ? this.inputVals[cur.Eval[1]]
          : cur.Eval[1];
        if (cur.Eval.length === 3) {
          var b = (cur.Eval[2] in this.inputVals)
            ? this.inputVals[cur.Eval[2]]
            : cur.Eval[2];
          this.inputVals[cur.Name] = funs[fn](a, b);
        }
        else {
          this.inputVals[cur.Name] = funs[fn](a);
        }
      }
    }
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

  for (var i=0; i<this.Actions.length; i++) {
    var cur_act = this.Actions[i];
    // == allows for 1 to evaluate as true
    var isTrue = (this.inputVals[cur_act.Trigger] == true);

    if (isTrue === true) {
      if (this.verbose) {
        console.log(cur_act.Trigger, isTrue, ':', cur_act.Object, cur_act.fn);
      }
      this.dev[cur_act.Object][cur_act.fn]();
    } else {
      if (this.verbose) {
        console.log(cur_act.Trigger, isTrue);
      }
    }
  }
};


Agent.prototype.setup = function() {
  var obj = fs.readFileSync(this.initFile, 'utf-8');
  this.ini = JSON.parse(obj).init;
  
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
    else if (cur.Type === 'MyClock'){ 
      if (!(cur.Name in this.dev)) {
        //var obj = new MyClock();
        this.dev[cur.Name] = new MyClock();
      }
      //console.log(obj);
    }
    else if (cur.Type === 'DHT'){
      // if name not in list of this.dev, then add it
      if (!(cur.Name in this.dev)){
        this.dev[cur.Name] = new DHT(cur.addr);
      }
      // else update values
      else {
        this.dev[cur.Name].readSensor();
      }
    }

  //this.dev[cur.Name] = obj;
  }
  
  this.InputValFn = this.ini.InputVals;
  
  if (this.verbose) {
    console.log('Setup: devices');
    console.log(this.dev);
    console.log(this.dev.time.getTimeStamp());
    console.log(this.InputValFn);
  }
  
  for (var i=0; i<this.ini.Evals.length; i++) {
      var cur = this.ini.Evals[i];
      //console.log(i, cur);
      this.InputValFn.push({"Name":cur.Name, "Eval": cur.Eval});
  }
  if (this.verbose) {
    console.log('evals', this.InputValFn);
  }

  this.Actions = this.ini.Actions;
  
  // If there are variables to log make sure that the proper filename is set 
  // and that a new file is created (with a header) if necessary.
  //console.log('checking...');

  this.logfn = this.GetRecentLogFile();
  //console.log(this.logfn);

  if (this.logfn == -1) {
    // no log file yet, make new one
    this.MakeFileName();
    this.logVars = this.ini.DataLog;
    this.WriteLogHeader();
  } 
  else {
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
      this.logVars = this.ini.DataLog;
      this.IterFileName();
      this.WriteLogHeader();
    }
  }
  // otherwise filename has already been set and header written.
  this.inputVals.date = this.makeFn().substr(0,10);
};


Agent.prototype.GetRecentLogFile = function() {
  // returns most recent iteration of log file.  Assumes the user isn't renaming
  // files.
  var myclk = new MyClock();
  var tdate = myclk.makeFn().split('.')[0];
  var rexp = new RegExp(tdate);
  var filt_fun = function(i) { return rexp.test(i); };
  var todays_files = fs.readdirSync('./data/').filter(filt_fun);
  console.log(todays_files);
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
    var myclk = new MyClock();
    this.logfn = myclk.makeFn();
};


Agent.prototype.IterFileName = function() {
  // remove file extension
  var basename = this.logfn.split('.csv')[0];

  if (basename.indexOf('_') == -1) {
    // first iteration
    this.logfn = basename + '_1.csv';
    if (this.verbose) {
      console.log('iterfilename: ', this.logfn);
    }
  } else {
    // iterate '_1' part of basename
    var parts = basename.split('_');
    parts[1] = String(+parts[1] +1);
    this.logfn = parts.join('_') + '.csv';
    if (this.verbose) {
      console.log('iterfilename: ', this.logfn);
    }
  }

  if (this.verbose) {
    console.log('./data/' + this.logfn);
  }
};


Agent.prototype.dataLog = function() {

    var dat = '';

    for (var i=0; i<this.logVars.length; i++) {
    	var cur_val = (this.logVars[i] == 'Time' )
            ? this.inputVals[this.logVars[i]]
            : + this.inputVals[this.logVars[i]];
            //console.log(this.logVars[i], cur_val);
        dat += cur_val;
        if (i < this.logVars.length-1) { 
            dat += ',';
        }
    }
    dat += '\n';
    if (this.verbose) {
      console.log('./data/' + this.logfn);
    }
    fs.appendFileSync('./data/' + this.logfn, dat);
    
    // A file containing the most recent values is used for displaying.
    var dataWrite = 'recent = ' + JSON.stringify(this.inputVals, null, ' ');
    fs.writeFileSync('recent.json', dataWrite);
};


Agent.prototype.plotData = function() {

};

module.exports = Agent;


