'use strict';

var ChildProcess = require('child_process');

function DHT22(pin){
    this.pin = pin;
    this.cmd = "python /home/pi/sources/Adafruit_Python_DHT/examples/AdafruitDHT.py 22 " + this.pin;
}

DHT22.prototype.readSensor = function() {
    var result = ChildProcess.execSync(this.cmd).toString().trim();
    console.log(result);
    // Temp=16.7*  Humidity=64.0%
    
    // 'Temp=' is 5 characters
    var c = result.substr(5, result.indexOf('*')-5);
    this.tempC = parseFloat(c);
    
    // 'Humidity=' is 9 characters    
    var beg = result.indexOf('Humidity=') + 9;
    var n = result.indexOf('%') - beg;
    var h = result.substr(beg, n);
    this.humid = parseFloat(h);
}

DHT22.prototype.getHumid = function(){
    return this.humid;
};

DHT22.prototype.getTempC = function(){
    return this.tempC;
};

DHT22.prototype.getTempF = function(){
	var t = this.getTempC();
    t = (t * 1.8) + 32;
    t = parseFloat(t.toFixed(1));
    return t;
};

module.exports = DHT22;
