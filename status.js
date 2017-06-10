
var httpRequest = new XMLHttpRequest();

httpRequest.open('GET', 'status.json', false);
httpRequest.send();
var stat = JSON.parse(httpRequest.responseText).stat;
var titleText = JSON.parse(httpRequest.responseText).title;
document.title = titleText;

var title_area = document.getElementById('title_text');
title_area.innerText = titleText;

var area = document.getElementById('main');

for (var v in stat){
  cur = document.createElement("p");
  //console.log(stat[v]);
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

plot_it();
