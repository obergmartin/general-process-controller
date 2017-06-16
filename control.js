const Agent = require('./agent');
var a = new Agent('./init.json');

var mainLoop = function() {
    a.setup();
    a.updateVals();
    a.updateActs();
    a.dataLog();
};

/**
 * Self-adjusting interval to account for drifting
 * https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript/44337628#44337628
 * 
 * @param {function} workFunc  Callback containing the work to be done
 *                             for each interval
 * @param {int}      interval  Interval speed (in milliseconds) - This 
 * @param {function} errorFunc (Optional) Callback to run if the drift
 *                             exceeds interval
 */
function AdjustingInterval(workFunc, interval, errorFunc) {
    var that = this;
    var expected, timeout;
    this.interval = interval;

    this.start = function() {
        expected = Date.now() + this.interval;
        timeout = setTimeout(step, this.interval);
    }

    this.stop = function() {
        clearTimeout(timeout);
    }

    function step() {
        var drift = Date.now() - expected;
        if (drift > that.interval) {
            // You could have some default stuff here too...
            if (errorFunc) errorFunc();
        }
        workFunc();
        expected += that.interval;
        timeout = setTimeout(step, Math.max(0, that.interval-drift));
    }
}

// Define what to do if something goes wrong
var doError = function() {
    console.warn('The drift exceeded the interval.');
};

console.log("Starting Agent...");
mainLoop();
// (The third argument is optional)
var ticker = new AdjustingInterval(mainLoop, 60000, doError);
ticker.start();

