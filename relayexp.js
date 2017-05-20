//rewrite to use:
//https://docs.onion.io/omega2-docs/relay-expansion-node-module.html
'use strict';

var ChildProcess = require('child_process');

function RelayExp(addr){
    this.addr = addr;
    this.lastOn = 0;
    this.setRelayOff();
    this.lastOff = 0;//+ Date();
}
    
RelayExp.prototype.getStatus = function(){
    return this.status;
};

RelayExp.prototype.isOn = function(){
    return (this.status === 1);
};

RelayExp.prototype.isOff = function(){
    return (this.status === 0);
};

RelayExp.prototype.getTimeOn = function(){
    return this.isOn() * (+ new Date() - this.lastOn);
};

RelayExp.prototype.getTimeOff = function(){
    return this.isOff() * (+ new Date() - this.lastOff);
};

RelayExp.prototype.getMinutesOn = function(){
    return this.isOn() * (+ new Date() - this.lastOn) / 60000;
};

RelayExp.prototype.getMinutesOff = function(){
    return this.isOff() * (+ new Date() - this.lastOff) / 60000;
};

RelayExp.prototype.setRelayOn = function(){
    var cmd = "relay-exp " + this.addr + " on";
    ChildProcess.execSync(cmd);

    this.status = 1;
    this.lastOn = + new Date();
};

RelayExp.prototype.setRelayOff = function(){
    var cmd = "relay-exp " + this.addr + " off";
    ChildProcess.execSync(cmd);

    this.status = 0;
    this.lastOff = + new Date();
};

 
module.exports = RelayExp;
