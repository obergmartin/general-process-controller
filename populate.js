//https://github.com/RubaXa/Sortable

//https://www.sitepoint.com/css3-tabs-using-target-selector/
//var init = window.init2;
//console.log(init);

var init = {};
var tables = {};

var deviceFunctionsInput = {
  "DS": [
    "getTempC",
    "getTempF"
  ],
  "relayexp": [
    "isOn",
    "isOff",
    "getMinutesOn",
    "getMinutesOff"
  ],
  "gpio": [
    "isOn",
    "isOff",
    "getMinutesOn",
    "getMinutesOff"
  ],
  "MyClock": [
    "getTimeStamp"
  ]
};

var deviceFunctionsOutput = {
  "relayexp": [
    "setRelayOn",
    "setRelayOff"
  ],
  "gpio": [
    "setRelayOn",
    "setRelayOff"
  ],
  "DS": [
    " "
  ],
  "MyClock": [
    " "
  ]
};

var httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
            var data = JSON.parse(httpRequest.responseText);
            init = data.init;
            //console.log(init);
            show_page();
        }
    }
};
httpRequest.open('GET', 'init.json');
httpRequest.send(); 



function update_page() {
  dat = {};
  dat.DataLog = [];

  console.log(init);

  // Save Devices
  dat.Devices = [];
  for (var i=1; i<tables.Devices.rows.length; i++) {
    var r = {};
    r.Name = tables.Devices.rows[i].cells[0].children[0].value;
    r.Type = tables.Devices.rows[i].cells[1].children[0].value;
    r.addr = tables.Devices.rows[i].cells[2].children[0].value;
    
    if (r.Name !== "") {
      dat.Devices.push(r);
    }
  }
  
  // Save Input Values
  dat.InputVals = [];
  for (i=1; i<tables.InputVals.rows.length; i++) {
    var r = {};
    r.Name =    tables.InputVals.rows[i].cells[0].children[0].value;
    isChecked = tables.InputVals.rows[i].cells[1].children[0].checked;
    r.Device =  tables.InputVals.rows[i].cells[2].children[0].value;
    r.fn =      tables.InputVals.rows[i].cells[3].children[0].value;
    if (isChecked) {
      dat.DataLog.push(r.Name);
    }
    if (r.Name !== "") {
      dat.InputVals.push(r);
    }
  }
  
  // Save Evals
  dat.Evals = [];
  for (i=1; i< tables.Evals.rows.length; i++) {
    var r = {};
    r.Name =     tables.Evals.rows[i].cells[0].children[0].value;
    isChecked =  tables.Evals.rows[i].cells[1].children[0].checked;
    var curVal = tables.Evals.rows[i].cells[2].children[0].value;
    
    // If there's a comma, save as an array
    // ...should do some error checking
    if (curVal.indexOf(',') > 0) {
        r.Eval = curVal.split(',');
    } 
    // Else, save as a string
    else {
        r.Eval = curVal;
    }
    
    if (isChecked) {
      dat.DataLog.push(r.Name);
    }
    
    if (r.Name !== "") {
      dat.Evals.push(r);
    }
  }
  
  // Save Actions
  dat.Actions = [];
  for (i=1; i< tables.Actions.rows.length; i++) {
    var r = {};
    r.Trigger = tables.Actions.rows[i].cells[0].children[0].value;
    r.Object = tables.Actions.rows[i].cells[1].children[0].value;
    r.fn = tables.Actions.rows[i].cells[2].children[0].value;
    if (r.Trigger !== "") {
      dat.Actions.push(r);
    }
  }
  
  //console.log(dat.DataLog);
  
  xhr = new XMLHttpRequest();
  
    var url = "/setup.html";
    xhr.open("POST", url);//, true);
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () { 
        if (xhr.readyState == 4 && xhr.status == 200) {
            //var json = JSON.parse(xhr.responseText);
            console.log(xhr.responseText);
            alert(xhr.responseText);
        }
    };
    var dataSend = JSON.stringify({'init': dat}, null, ' ');
    console.log(dataSend);
    xhr.send(dataSend);
  window.location.href = "setup.html";
}


function getDeviceType(s) {
  for (var i = 0; i < init.Devices.length; i++) {
    if (init.Devices[i].Name == s) {
      return init.Devices[i].Type;
    }
  }
  return "Error - Not Found.";
}


function changeInputSelect() {
  //var x = this.parentElement.parentElement.children.length - 1;
  var c = this.parentElement.parentElement.children[3];
  var fns = deviceFunctionsInput[getDeviceType(this.value)];
  c.removeChild(c.firstChild);

  content = document.createElement('select');
  for (var i = 0; i < fns.length; i++) {
    content.options.add( new Option(fns[i], fns[i]) );
  }
  content.value = 'Select';
  c.appendChild(content);
}


function changeActionSelect() {
  //var x = this.parentElement.parentElement.children.length - 1;
  var c = this.parentElement.parentElement.children[2];
  var fns = deviceFunctionsOutput[getDeviceType(this.value)];
  c.removeChild(c.firstChild);

  content = document.createElement('select');
  for (var i = 0; i < fns.length; i++) {
    content.options.add( new Option(fns[i], fns[i]) );
  }
  content.value = 'Select';
  c.appendChild(content);
}


function make_row(cellInfo) {
// Returns a TR element with necessary TD children to be attached to a document.
//
  var r = document.createElement('tr');
  
  for (var i=0; i<cellInfo.length; i++) {
    var cur = cellInfo[i];
    var new_cell = document.createElement('td');
    var content = document.createElement('p');
    if (cur.type === 'inputText'){
      content = document.createElement("input");
      content.type = "text";
      content.value = cur.val;
    } 
    else if (cur.type === "inputAddr") {
      // attach function for when text box is selected
      //x.parentElement.children[1].children[0].value
      content = document.createElement("input");
      content.type = "text";
      content.value = cur.val;
    }
    else if (cur.type === "selectMenu"){
      content = document.createElement("select");
      for (var j=0; j<cur.val[0].length; j++) {
        content.options.add( new Option(cur.val[0][j], cur.val[0][j]) );
      }
      content.value = cur.val[1];
    } 
    else if (cur.type === "checkBox") {
      content = document.createElement("input");
      content.type = "checkbox";
      content.checked = cur.val;
    } 
    else if (cur.type == null) {
      content = document.createElement('p');
      //console.log(cur);
      content.innerHTML = cur;//['val'];
    }
    new_cell.appendChild(content);
    r.appendChild(new_cell);
  }
  return r;
}


function show_page(){
//
// Device Setup
//
var avail_devs = [];
var dev_area = document.getElementById("input_dev_area");
dev_area.align = 'left';

//make table
tables.Devices = document.createElement('table');
var sortableDevices = Sortable.create(tables.Devices, {
  filter: '.js-remove',
  onFilter: function (evt) {
    var el = editableList.closest(evt.item); // get dragged item
    el && el.parentNode.removeChild(el);
  }
});
var header = tables.Devices.createTHead();
header.appendChild( make_row(['Name', 'Device', 'Address']) );

// Add rows from DEVICES section  
for (var i=0; i<init.Devices.length; i++) {
  var new_row = make_row( [
    {'type': 'inputText', 'val': init.Devices[i].Name},
    {'type': 'selectMenu', 'val': [["DS","gpio", "relayexp","MyClock"], init.Devices[i].Type]},
    {'type': 'inputText', 'val': init.Devices[i].addr} ]);
  tables.Devices.appendChild(new_row);
  avail_devs.push(init.Devices[i].Name);
}
dev_area.appendChild(tables.Devices);

// Button to add new rows
var dev_button = document.createElement("input");
dev_button.type = 'button';
dev_button.value = "Add Row";
dev_button.onclick = function(){ 
  var new_row = make_row( [
    {'type': 'inputText', 'val': ''},
    {'type': 'selectMenu', 'val': [["DS","gpio", "relayexp","MyClock"], "Select"]},
    {'type': 'inputText', 'val': ''} ]);
  tables.Devices.appendChild(new_row);
};

dev_area.appendChild(dev_button);


//
// Input Variables
//
var var_area = document.getElementById("input_var_area");
var_area.align = 'left';
      
//make table
tables.InputVals = document.createElement('table');
var sortableInputVals = Sortable.create(tables.InputVals);
header = tables.InputVals.createTHead();
header.appendChild( make_row(['Name', 'Log', 'Device', 'Function']) );
  
for (i=0; i<init.InputVals.length; i++) {
  var isChecked = (init.DataLog.indexOf(init.InputVals[i].Name) != -1);
  var avail_fns = deviceFunctionsInput[getDeviceType(init.InputVals[i].Device)];
  var new_row = make_row( [
    {'type': 'inputText', 'val': init.InputVals[i].Name},
    {'type': 'checkBox', 'val': isChecked},
    {'type': 'selectMenu', 'val': [avail_devs, init.InputVals[i].Device]},
    {'type': 'selectMenu', 'val': [avail_fns, init.InputVals[i].fn]}
  ]);
  new_row.children[2].children[0].onchange = changeInputSelect;
  tables.InputVals.appendChild(new_row);
  
}
var_area.appendChild(tables.InputVals);

var var_button = document.createElement("input");
var_button.type = 'button';
var_button.value = "Add Row";
var_button.onclick = function() {
  var new_row = make_row( [
    {'type': 'inputText', 'val': ''},
    {'type': 'checkBox', 'val': 0},
    {'type': 'selectMenu', 'val': [avail_devs, "Select"]},
    {'type': 'selectMenu', 'val': ['','']}
  ]);
  new_row.children[2].children[0].onchange = changeInputSelect;
  tables.InputVals.appendChild(new_row);};

var_area.appendChild(var_button);


//
// Evaluated Variables
//
var eval_area = document.getElementById("eval_var_area");
var_area.align = 'left';

//make table
tables.Evals = document.createElement('table');
var sortableEvals = Sortable.create(tables.Evals);
header = tables.Evals.createTHead();
header.appendChild( make_row(['Name', 'Log', 'Eval']) );

  
for (i=0; i<init.Evals.length; i++) {
    
  var isChecked = (init.DataLog.indexOf(init.Evals[i].Name) != -1);
  
  var new_row = make_row( [
    {'type': 'inputText', 'val': init.Evals[i].Name},
    {'type': 'checkBox', 'val': isChecked},
    {'type': 'inputText', 'val': init.Evals[i].Eval} ]);
  tables.Evals.appendChild(new_row);  
}

eval_area.appendChild(tables.Evals);

var eval_button = document.createElement("input");
eval_button.type = 'button';
eval_button.value = "Add Row";
eval_button.onclick = function(){ 
var new_row = make_row( [
    {'type': 'inputText', 'val': ''},
    {'type': 'checkBox', 'val': 0},
    {'type': 'inputText', 'val': ''} 
]);
tables.Evals.appendChild(new_row);};

eval_area.appendChild(eval_button);


//
// Action Setup
//

//get parent
var act_area = document.getElementById("input_act_area");
act_area.align = 'left';

//make table
tables.Actions = document.createElement('table');
var sortableActions = Sortable.create(tables.Actions);
header = tables.Actions.createTHead();
header.appendChild( make_row(['Name', 'Device', 'Action']) );

for (i=0; i<init.Actions.length; i++) {
  var cur_dev = getDeviceType(init.Actions[i].Object);
  var new_row = make_row( [
    {'type': 'inputText', 'val': init.Actions[i].Trigger},
    {'type': 'selectMenu', 'val': [avail_devs, init.Actions[i].Object]},
    {'type': 'selectMenu', 'val': [deviceFunctionsOutput[cur_dev], init.Actions[i].fn]}
  ]);
  new_row.children[1].children[0].onchange = changeActionSelect;
  tables.Actions.appendChild(new_row);
}
act_area.appendChild(tables.Actions);

var action_button = document.createElement("input");
action_button.type = 'button';
action_button.value = "Add Row";
action_button.onclick = function(){ 
  var new_row = make_row( [
    {'type': 'inputText', 'val': ''},
    {'type': 'selectMenu', 'val': [avail_devs, "Select"]},
    {'type': 'selectMenu', 'val': ['', '']}
  ]);
  new_row.children[1].children[0].onchange = changeActionSelect;
  tables.Actions.appendChild(new_row);
};

act_area.appendChild(action_button);

var dat = {};


var tail_area = document.getElementById("tail_area");

var update_button = document.getElementById("update_button");
update_button.value = "Update!";
update_button.onclick = function(){ update_page(); };

tail_area.appendChild(update_button);
}
