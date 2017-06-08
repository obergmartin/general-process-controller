function make_row(cellInfo) {
  // Returns a TR element with necessary TD children to be attached to a document.
  
  var r = document.createElement('tr');
  
  for (var i = 0; i < cellInfo.length; i++) {
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
      for (var j = 0; j < cur.val[0].length; j++) {
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