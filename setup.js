//https://github.com/RubaXa/Sortable
//https://www.sitepoint.com/css3-tabs-using-target-selector/

var deviceFunctionsInput = {
  "DHT": [
    "getHumid",
    "getTempC",
    "getTempF"
  ],
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
    "getStatus",
    "isOn",
    "isOff",
    "getMinutesOn",
    "getMinutesOff"
  ],
  "Timer": [
    "getTimeStamp",
    "getTime24",
    "getDawn",
    "getDusk",
    "getSunrise",
    "getSunset"
  ]
};

var deviceTypes = [];
for (var i in deviceFunctionsInput) {
  deviceTypes.push(i);
}

var deviceFunctionsOutput = {
  "relayexp": [
    "setRelayOn",
    "setRelayOff"
  ],
  "gpio": [
    "setRelayOn",
    "setRelayOff",
    "ignoreLastInput"
  ],
  "DS": [
    " "
  ],
  "DHT": [
    " "
  ],
  "Timer": [
    " "
  ]
};

var evalFunctions = [
  "const",
  "gt",
  "gte",
  "lt",
  "lte",
  "eq",
  "and",
  "or",
  "not",
  "add",
  "sub",
  "diff"
]

var sort_opts = {
  filter: '.js-remove',
  onFilter: function (evt) {
    var el = editableList.closest(evt.item); 
    el && el.parentNode.removeChild(el);
  }
};


function update_page() {
  dat = {};
  dat.DataLog = [];

  console.log(init);

  // Save Devices
  //dat.Devices = [];
  //for (var i = 1; i < tables.Devices.rows.length; i++) {
  //  var r = {};
  //  r.Name = tables.Devices.rows[i].cells[0].children[0].value;
  //  r.Type = tables.Devices.rows[i].cells[1].children[0].value;
  //  r.addr = tables.Devices.rows[i].cells[2].children[0].value;
  //  if (r.Name !== "") {
  //    dat.Devices.push(r);
  //  }
  //}
  
  // Save Input Values
  dat.InputVals = [];
  for (i = 1; i < tables.InputVals.rows.length; i++) {
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
  for (i = 1; i < tables.Evals.rows.length; i++) {
    var r = {};
    r.Name =     tables.Evals.rows[i].cells[0].children[0].value;
    isChecked =  tables.Evals.rows[i].cells[1].children[0].checked;
    r.a =        tables.Evals.rows[i].cells[2].children[0].value;
    r.Function = tables.Evals.rows[i].cells[3].children[0].value;
    r.b =        tables.Evals.rows[i].cells[4].children[0].value;
        
    if (isChecked) {
      dat.DataLog.push(r.Name);
    }
    if (r.Function == 'const') {
      r.b = "";
    }
    
    if (r.Name !== "") {
      dat.Evals.push(r);
    }
  }
  
  // Save Actions
  dat.Actions = [];
  for (i = 1; i < tables.Actions.rows.length; i++) {
    var r = {};
    r.Trigger = tables.Actions.rows[i].cells[0].children[0].value;
    r.Device = tables.Actions.rows[i].cells[1].children[0].value;
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
  //for (var i = 0; i < init.Devices.length; i++) {
  for (var i = 0; i < init.Devices.length; i++) {
    if (init.Devices[i].Name == s) {
      return init.Devices[i].Type;
    }
  }
  return "Error - Not Found.";
}

function toggleEvalTextBox() {
  // if the selected function takes a single argument, we need to show only 
  // the first and hide the second.
  
  var singleInputs = ['not', 'const'];
  // the 4th child in the row is the second input 
  var c = this.parentElement.parentElement.children[4];
  
  if (this.value == 'const') {
    c.style.display = 'none';
  }
  else if (this.value == 'not') {
    c.style.display = 'none';
  }
  else 
  {
    c.style.display = 'block';
  }
}

function changeInputSelect() {
  // Populates Input Variable Function dropdown menu based on selected Device
  
  // go up two levels to get to table row and then get third child
  var c = this.parentElement.parentElement.children[3];
  c.removeChild(c.firstChild);
  
  // the functions available to the device
  var fns = deviceFunctionsInput[getDeviceType(this.value)];

  // create new dropdown menu and append it
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

//
// show_page
//

function show_page(){

  // Device Setup
  // need to read devices.json to get list of available devices
  var avail_devs = [];
  var httpRequest = new XMLHttpRequest();
  httpRequest.open('GET', 'devices.json', false);
  httpRequest.send();
  //console.log(httpRequest.responseText);
  var devices = JSON.parse(httpRequest.responseText).Devices;
  init.Devices = devices;
  //console.log(devices);
  for (var i = 0; i < devices.length; i++) {
    avail_devs.push(devices[i].Name);
  }


  //
  // Input Variables
  //
  var var_area = document.getElementById("input_var_area");
  var_area.align = 'left';
      
  //make table
  tables.InputVals = document.createElement('table');
  var sortableInputVals = Sortable.create(tables.InputVals, sort_opts);
  header = tables.InputVals.createTHead();
  header.appendChild( make_row(['Name', 'Log', 'Device', 'Function']) );
  
  for (i = 0; i < init.InputVals.length; i++) {
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
  var_button.value = 'Add Row';
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
  var sortableEvals = Sortable.create(tables.Evals, sort_opts);
  header = tables.Evals.createTHead();
  header.appendChild( make_row(['Name', 'Log', 'Value', 'Function', 'Value']) );
  
  for (i = 0; i < init.Evals.length; i++) {
    var isChecked = (init.DataLog.indexOf(init.Evals[i].Name) != -1);
    var new_row = make_row( [
      {'type': 'inputText', 'val': init.Evals[i].Name},
      {'type': 'checkBox', 'val': isChecked},
      {'type': 'inputText', 'val': init.Evals[i].a, 'size': 8},
      {'type': 'selectMenu', 'val': [evalFunctions, init.Evals[i].Function]},
      {'type': 'inputText', 'val': init.Evals[i].b, 'size': 8} 
    ]);
    if ((init.Evals[i].Function == 'const') | (init.Evals[i].Function == 'not')) {
      new_row.children[4].style.display = 'none';
    }
    new_row.children[3].children[0].onchange = toggleEvalTextBox;
    tables.Evals.appendChild(new_row);
  }

  eval_area.appendChild(tables.Evals);

  var eval_button = document.createElement('input');
  eval_button.type = 'button';
  eval_button.value = 'Add Row';
  eval_button.onclick = function(){ 
  var new_row = make_row( [
    {'type': 'inputText', 'val': ''},
    {'type': 'checkBox', 'val': 0},
    {'type': 'inputText', 'val': '', 'size': 8} ,
    {'type': 'selectMenu', 'val': [evalFunctions, '']},
    {'type': 'inputText', 'val': '', 'size': 8} 
  ]);
  new_row.children[3].children[0].onchange= toggleEvalTextBox;
  tables.Evals.appendChild(new_row);};

  eval_area.appendChild(eval_button);

  //
  // Action Setup
  //

  //get parent
  var act_area = document.getElementById('input_act_area');
  act_area.align = 'left';

  //make table
  tables.Actions = document.createElement('table');
  var sortableActions = Sortable.create(tables.Actions);
  header = tables.Actions.createTHead();
  header.appendChild( make_row(['Trigger Variable', 'Device', 'Action']) );

  for (i = 0; i < init.Actions.length; i++) {
    var cur_dev = getDeviceType(init.Actions[i].Device);
    var new_row = make_row( [
      {'type': 'inputText', 'val': init.Actions[i].Trigger},
      {'type': 'selectMenu', 'val': [avail_devs, init.Actions[i].Device]},
      {'type': 'selectMenu', 'val': [deviceFunctionsOutput[cur_dev], init.Actions[i].fn]}
    ]);
    new_row.children[1].children[0].onchange = changeActionSelect;
    tables.Actions.appendChild(new_row);
  }
  act_area.appendChild(tables.Actions);

  var action_button = document.createElement('input');
  action_button.type = 'button';
  action_button.value = 'Add Row';
  action_button.onclick = function(){ 
    var new_row = make_row( [
      {'type': 'inputText', 'val': ''},
      {'type': 'selectMenu', 'val': [avail_devs, 'Select']},
      {'type': 'selectMenu', 'val': ['', '']}
    ]);
    new_row.children[1].children[0].onchange = changeActionSelect;
    tables.Actions.appendChild(new_row);
  };

  act_area.appendChild(action_button);

  var dat = {};

  var tail_area = document.getElementById('tail_area');

  var update_button = document.getElementById('update_button');
  update_button.value = 'Update!';
  update_button.onclick = function(){ update_page(); };

  tail_area.appendChild(update_button);
}





