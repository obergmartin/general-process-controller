const Agent = require('./agent');

var a = new Agent('./init.json');

var mainLoop = function() {
    a.setup();
    a.updateVals();
    a.updateActs();
    a.dataLog();
};

console.log("Starting Agent...");
mainLoop();
setInterval(mainLoop, 60000);

