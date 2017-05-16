var temptext = document.getElementById('temptext');
var setpointtext = document.getElementById('setpointtext');
var timetext = document.getElementById('timetext');


timetext.innerText="Last reading at: " + recent.Time;
temptext.innerText="Sensor Temp: " + recent.temp1;
setpointtext.innerText="Setpoint: " + recent.warmPt;
relaytext.innerText="The relay is " + ["Off", "On"][recent.isOn];
temp2text.innerText="Tap Temp: " + recent.temp2;
//floortext.innerText="The floor is currently " + ["nice and dry.", "FLOODED!"][0];



var httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
            //console.log(httpRequest.responseText);
            //document.data = JSON.parse(httpRequest.responseText.slice(7, httpRequest.responseText.length));
            //init = data.init;
            //console.log(init);
            //show_page();
            
            //return data;
        }
    }
};

var getfile = recent.date+'.csv';
//console.log(getfile);
httpRequest.open('GET', getfile, false);
httpRequest.send();
//console.log('response');
//console.log(httpRequest.responseText);
var data = JSON.parse(httpRequest.responseText.slice(7, httpRequest.responseText.length)); 
//console.log(data);

plot_it();
    
    
    
    
    
