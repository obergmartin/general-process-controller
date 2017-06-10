var httpRequest = new XMLHttpRequest();

httpRequest.open('GET', 'plotedit.json', false);
httpRequest.send();
var plotVars = JSON.parse(httpRequest.responseText).plotVars;
//console.log(plotVars);  
   
var pltColors = [
    window.chartColors.blue,
    window.chartColors.green,
    window.chartColors.red
]; 
    
plot_it = function() {
  

  var cols = Object.keys(data);
  var xdata = [];
  var ydata = [];
  
  var k = -1; // for indexing color
  
  for (var v in plotVars) {
    //if (cols[i] === 'Time') {
    if (plotVars[v].Axis === "x") {
      xdata = data[v];
      var x_label = plotVars[v].Label;
    } 
    else {
      k += 1;
      var yaxid = plotVars[v].Options;

      //var new_data = {};

      if (plotVars[v].isBool) {
        var new_data = {
          data: data[v],
          type: "line",
          label: plotVars[v].Label,
          fill: 'origin',
          borderColor: pltColors[k],
          backgroundColor: pltColors[k].replace(')', ', 0.2)').replace('rgb', 'rgba'),
          lineTension: 0,
          yAxisID: yaxid,
        }
      }
      else {
        var new_data = {
          type: "line",
          label: plotVars[v].Label,
          fill: false,
          data: data[v],
          borderColor: pltColors[k],
          backgroundColor: pltColors[k],
          lineTension: 0,
          yAxisID: yaxid,
        }
      
      }
      
      // Add Axes here:
      // plotVars[v].Options can be L1, L2...

      ydata.push(new_data);
    }
  }

  var config = {
    data: {
      labels: xdata,
      datasets: ydata
    },
    options: {
      responsive: true,
      animation : false,
      title: {
        display: true,
        text: getfile
      },
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      hover: {
        mode: 'nearest',
        intersect: true
      },
      scales: {
        xAxes: [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: x_label
          }
        }],
        yAxes: [
        {
          position: "left",
          "id": "L1"
        },{
          position: "right",
          "id": "R1",
          ticks: {
            fontColor: window.chartColors.red, // this here
            stepSize: 1,
            display: false
          },
          gridLines: {
            display: false,
          }
        }]
      }
    }
  };

  var ctx = document.getElementById("canvas").getContext("2d");
  window.myLine = new Chart(ctx, config);
};    



