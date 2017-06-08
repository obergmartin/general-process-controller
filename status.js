//var temptext = document.getElementById('temptext');
//var setpointtext = document.getElementById('setpointtext');
//var relaytext = document.getElementById('relaytext');
//var timetext = document.getElementById('timetext');

//timetext.innerText="Last reading at: " + recent.Time;
//temptext.innerText="Sensor Temp: " + recent.temp1;
//setpointtext.innerText="Setpoint: " + recent.warmPt;
//relaytext.innerText="The relay is: " + ["Off", "On"][+recent["isOn]"]];
//temp2text.innerText="Tap Temp: " + recent.temp2;
//floortext.innerText="The floor is currently " + ["nice and dry.", "FLOODED!"][0];
var httpRequest = new XMLHttpRequest();

httpRequest.open('GET', 'status.json', false);
httpRequest.send();
var stat = JSON.parse(httpRequest.responseText).stat;

var area = document.getElementById('main');

for (var v in stat){
  cur = document.createElement("p");
  console.log(stat[v]);
  cur.innerText = stat[v].Label;
  if (stat[v].Value === '') {
    cur.innerText += recent[v];
  } else {
    cur.innerText += stat[v].Value[+recent[v]];
  }
  area.appendChild(cur);
  
  
}



var getfile = recent.date+'.csv';
httpRequest.open('GET', getfile, false);
httpRequest.send();
var data = JSON.parse(httpRequest.responseText.slice(7, httpRequest.responseText.length)); 

//console.log(data);

plot_it();
    
    
    
    
    
