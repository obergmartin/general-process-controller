'use strict';


function Timer(){
}
    
var pad = function(num) {
    var norm = Math.abs(Math.floor(num));
    return (norm < 10 ? '0' : '') + norm;
};

Timer.prototype.getTimeStamp = function(){
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
}

Timer.prototype.getTime24 = function(){
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return h + (m / 60);
}

Timer.prototype.makeFn = function(){
	var d = new Date();
    //return d.toISOString().substr(0,10)+".csv";
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'.csv';
}
 
module.exports = Timer;
