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

MyClock.prototype.makeFn = function(){
    // Not using this anymore, but may be handy later
	var d = new Date();
    //return d.toISOString().substr(0,10)+".csv";
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'.csv';
}
 
module.exports = MyClock;
