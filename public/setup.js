//https://github.com/RubaXa/Sortable
//https://www.sitepoint.com/css3-tabs-using-target-selector/

var tables = {};
var init = {};
var devices = {};

var deviceTypes = [];
for (var i in deviceFunctionsInput) {
  deviceTypes.push(i);
}

var avail_devs = [];
//var avail_fns = [];

var sort_opts = {
  filter: '.js-remove',
  onFilter: function (evt) {
    var el = editableList.closest(evt.item); 
    el && el.parentNode.removeChild(el);
  }
};


ws.onopen = function() {
  ws.send(JSON.stringify({getFile: 'init.json'}));
}
ws.onmessage = function(event) {

  var mess = JSON.parse(event.data);
  console.log(mess);
  if (mess.hasOwnProperty('init')) {
    init = mess['init'];
    ws.send(JSON.stringify({getFile: 'devices.json'}));
  }
  else if (mess.hasOwnProperty('Devices')) {
    devices = mess['Devices'];
    show_page();
  }
}


function makeInputRow(tn, cb, sd, fns, sf) {
    var new_row = document.createElement('tr');
    // Name Input
    var content = document.createElement('input');
    content.type = 'text';
    content.value = tn;
    var new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    // Log Checkbox
    content = document.createElement('input');
    content.type = 'checkBox';
    content.checked = cb;
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    // Device Type
    content = document.createElement('select');
    for (var j = 0; j < avail_devs.length; j++) {
      content.options.add( new Option(avail_devs[j], avail_devs[j]) );
    }
    content.value = sd;
    content.onchange = changeInputSelect;
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    // Device Function
    content = document.createElement('select');
    for (var j = 0; j < fns.length; j++) {
      content.options.add( new Option(fns[j], fns[j]) );
    }
    content.value = sf;
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    return new_row;
}

function makeEvalRow(t1, cb, ta, sv, tb) {
    new_row = document.createElement('tr');
    
    content = document.createElement('input');
    content.type = 'text';
    content.value = t1;
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    content = document.createElement('input');
    content.type = 'checkbox';
    content.checked = cb;
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    content = document.createElement('input');
    content.type = 'text';
    content.value = ta;
    content.size = 8;
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    content = document.createElement('select');
    for (var j = 0; j < evalFunctions.length; j++) {
      content.options.add( new Option(evalFunctions[j], evalFunctions[j]) );
    }
    content.value = sv;
    content.onchange = toggleEvalTextBox; // for toggling display of 'B'
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    content = document.createElement('input');
    content.type = 'text';
    content.value = tb;
    content.size = 8;
    if ((sv == 'const') | (sv == 'not')) { // for initial hiding
      content.style.display = 'none';
    }
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    return new_row;
}

function makeActionRow(t1, s1, fns, s2) {
    var new_row = document.createElement('tr');
    
    var content = document.createElement('input');
    content.type = 'text';
    content.value = t1;
    var new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    content = document.createElement('select');
    for (var j = 0; j < avail_devs.length; j++) {
      content.options.add( new Option(avail_devs[j], avail_devs[j]) );
    }
    content.value = s1;
    content.onchange = changeActionSelect;
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);

    content = document.createElement('select');
    for (var j = 0; j < fns.length; j++) {
      content.options.add( new Option(fns[j], fns[j]) );
    }
    content.value = s2;
    new_cell = document.createElement('td');
    new_cell.appendChild(content);
    new_row.appendChild(new_cell);
    
    return new_row;
}


function update_page() {
  dat = {};
  dat.DataLog = [];

  console.log(init);

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
  
  //xhr = new XMLHttpRequest();
  //var url = "/setup.html";
  //xhr.open("POST", url);//, true);
  //xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
  //xhr.onreadystatechange = function () { 
  //  if (xhr.readyState == 4 && xhr.status == 200) {
  //    //var json = JSON.parse(xhr.responseText);
  //    console.log(xhr.responseText);
  //    alert(xhr.responseText);
  //  }
  //};
  //var dataSend = JSON.stringify({'init': dat}, null, ' ');
  
  var dataSend = {"saveData": {"File": "init.json", "Data": {'init': dat}}};
  console.log(dataSend);
  ws.send(JSON.stringify(dataSend));
  //xhr.send(dataSend);
  //window.location.href = "setup.html";
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

function show_page() {
  // Device Setup
  // need to read devices.json to get list of available devices
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
  header.appendChild(makeTextRow(['Name', 'Log', 'Device', 'Function']));
  
  for (i = 0; i < init.InputVals.length; i++) {
    var curIV = init.InputVals[i];
    var isChecked = (init.DataLog.indexOf(curIV.Name) != -1);
    var avail_fns = deviceFunctionsInput[getDeviceType(curIV.Device)];

    new_row = makeInputRow(curIV.Name, isChecked, curIV.Device, avail_fns, curIV.fn);    
    tables.InputVals.appendChild(new_row);
  }  
  var_area.appendChild(tables.InputVals);

  var var_button = document.createElement("input");
  var_button.type = 'button';
  var_button.value = 'Add Row';
  var_button.onclick = function() {
    tables.InputVals.appendChild(makeInputRow('', 0, '', '', ''));
  };
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
  header.appendChild( makeTextRow(['Name', 'Log', 'Value', 'Function', 'Value']) );
  
  for (i = 0; i < init.Evals.length; i++) {
    var curEval = init.Evals[i];
    var isChecked = (init.DataLog.indexOf(curEval.Name) != -1);
    
    new_row = makeEvalRow(curEval.Name, isChecked, curEval.a, curEval.Function, curEval.b);
    tables.Evals.appendChild(new_row);
  }
  eval_area.appendChild(tables.Evals);

  var eval_button = document.createElement('input');
  eval_button.type = 'button';
  eval_button.value = 'Add Row';
  eval_button.onclick = function() {
    var new_row = makeEvalRow('', 0, '', '', '');
    tables.Evals.appendChild(new_row);
  };
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
  header.appendChild( makeTextRow(['Trigger Variable', 'Device', 'Action']) );

  for (i = 0; i < init.Actions.length; i++) {
    var cur_act = init.Actions[i];
    var avail_fn = deviceFunctionsOutput[getDeviceType(cur_act.Device)];

    new_row = makeActionRow(cur_act.Trigger, cur_act.Device, avail_fn, cur_act.fn);
    tables.Actions.appendChild(new_row);
  }
  act_area.appendChild(tables.Actions);

  var action_button = document.createElement('input');
  action_button.type = 'button';
  action_button.value = 'Add Row';
  action_button.onclick = function(){ 
    var new_row = makeActionRow('', '', '', '');
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





