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

var config = {};
var axisOpts = [];
var axisids = [];
var plotYaxes = [];
    
plot_it = function() {
  

  var cols = Object.keys(data);
  var xdata = [];
  var ydata = [];
  
  var k = -1; // for indexing color
  
  var curAxisOption = 'L1';
  var curYaxis = {};
  var defYaxis = {
    position: "left",
    //id: curAxisOption
  };
  
  var rightAxis = {
    position: "right",
    id: "R1",
    ticks: {
      fontColor: window.chartColors.red, // this here
      stepSize: 1,
      display: false
    },
    gridLines: {
      display: false,
    }
  };

        
  
  for (var v in plotVars) {
    if (plotVars[v].Axis === "x") {
      xdata = data[v];
      
      var plotXaxes = [{
          display: true,
          scaleLabel: {
            display: true,
            labelString: plotVars[v].Label
          }
      }];
    }
    else {
      k += 1;
      var yaxid = plotVars[v].Options;
      console.log(yaxid);

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
          yAxisID: yaxid
        }
        curYaxis = rightAxis;
        if (axisids.indexOf(yaxid) < 0) {
          //axisids.push(yaxid);
          plotYaxes.push(curYaxis);
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
        curYaxis = {
          position: "left",
          ticks: { fontColor: pltColors[k] },
          id: yaxid
        };
        //curYaxis.id = yaxid;
        console.log(curYaxis);
        if (axisids.indexOf(yaxid) < 0) {
          axisids.push(yaxid);
          plotYaxes.push(curYaxis);
        }
      }
      
      ydata.push(new_data);
      
    }
  }
  

  config = {
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
        xAxes: plotXaxes,
        yAxes: plotYaxes
      }
    }
  };
  
  if (axisids.length === 1) {
    config.options.scales.yAxes[0].ticks.fontColor = "rgb(51,51,51)";
    console.log("gray axis");
  }


  var ctx = document.getElementById("canvas").getContext("2d");
  window.myLine = new Chart(ctx, config);
};    



