'use strict';


function MyClock(){
}
    
var pad = function(num) {
    var norm = Math.abs(Math.floor(num));
    return (norm < 10 ? '0' : '') + norm;
};

MyClock.prototype.getTimeStamp = function(){
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
}

MyClock.prototype.getTime24 = function(){
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return d + (m / 60);
}

MyClock.prototype.makeFn = function(){
	var d = new Date();
    //return d.toISOString().substr(0,10)+".csv";
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'.csv';
}
 
module.exports = MyClock;
