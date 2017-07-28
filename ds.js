'use strict';

var ChildProcess = require('child_process');

function DS(addr){
	// for future use:
	//r = prc.execSync('cat /sys/devices/w1_bus_master1/w1_master_slaves').toString().trim().split('\n')
    this.addr = addr;
    this.cmd = "cat /sys/devices/w1_bus_master1/" + this.addr + "/w1_slave";
}

DS.prototype.getTempC = function(){
    var result = ChildProcess.execSync(this.cmd).toString().trim();

    var i = result.search('t=');
    var t = result.substring(i+2) / 1000;
    t = parseFloat(t.toFixed(1));
    this.tempC = t;

    return t;
};

DS.prototype.getTempF = function(){
	var t = this.getTempC();
    t = (t * 1.8) + 32;
    t = parseFloat(t.toFixed(1));
    return t;
};

DS.prototype.getStatus = function() {
    return this.getTempC();
};

module.exports = DS;
