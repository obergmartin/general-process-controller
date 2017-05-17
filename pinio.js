'use strict';


function PinIO(pin){
    this.pin = pin;
    this.lastOn = + Date();
    this.lastOff = + Date();
    //this.setRelayOff();
}
    
PinIO.prototype.getStatus = function(){
    return this.status;
};

PinIO.prototype.isOn = function(){
    return this.status === 1;
};

PinIO.prototype.isOff = function(){
    return this.status === 0;
};

PinIO.prototype.getTimeOn = function(){
    return + new Date() - this.lastOn;
};

PinIO.prototype.getTimeOff = function(){
    return + new Date() - this.lastOff;
};

PinIO.prototype.getMinutesOn = function(){
    return this.isOn() * (+ new Date() - this.lastOn) / 60000;
};

PinIO.prototype.getMinutesOff = function(){
    return this.isOff() * (+ new Date() - this.lastOff) / 60000;
};

PinIO.prototype.setRelayOn = function(){
    var ChildProcess = require('child_process');
    var cmd = "gpioctl dirout-high " + this.pin;
    ChildProcess.execSync(cmd);

    this.status = 1;
    this.lastOn = + new Date();
};

PinIO.prototype.setRelayOff = function(){
    var ChildProcess = require('child_process');
    var cmd = "gpioctl dirout-low " + this.pin;
    ChildProcess.execSync(cmd);

    this.status = 0;
    this.lastOff = + new Date();
};

 
module.exports = PinIO;