// all moved to status.html







var httpRequest = new XMLHttpRequest();

httpRequest.open('GET', 'status.json', false);
httpRequest.send();
var stat = JSON.parse(httpRequest.responseText).stat;
var titleText = JSON.parse(httpRequest.responseText).title;
document.title = titleText;



httpRequest.open('GET', 'recent.json', false);
httpRequest.send();
//console.log(httpRequest.responseText);
var recent = JSON.parse(httpRequest.responseText.slice(9, httpRequest.responseText.length));
//console.log(recent);

//httpRequest.open('GET', 'loglist.json', false);
//httpRequest.send();
//console.log(httpRequest.responseText);
//var loglist = JSON.parse(httpRequest.responseText).loglist;//.slice(9, httpRequest.responseText.length);
//console.log(loglist);


var data = {};
var getfile = recent.date+'.csv';

//var host = window.document.location.host.replace(/:.*/, '');
//var ws = new WebSocket('ws://' + host + ':8080');
ws.onopen = function(){
  
  var msg = {"getLog": getfile};
  //console.log(msg);
  ws.send(JSON.stringify(msg));
  
};



var title_area = document.getElementById('title_text');
title_area.innerText = titleText;

var area = document.getElementById('main');

for (var v in stat){
  cur = document.createElement("p");
  //console.log(stat[v]);
  cur.innerText = stat[v].Label;
  if (stat[v].Value === '') {
    cur.innerText += recent[v];
  }
  else {
    cur.innerText += stat[v].Value[+recent[v]];
  }
  area.appendChild(cur);
}


//var getfile = recent.date+'.csv';
//httpRequest.open('GET', getfile, false);
//httpRequest.send();
//var data = JSON.parse(httpRequest.responseText.slice(7, httpRequest.responseText.length)); 

//plot_it();
