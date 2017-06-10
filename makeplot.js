  
plot_it = function() {


  var pltColors = [
    window.chartColors.blue,
    window.chartColors.green,
    window.chartColors.red
  ];
    var cols = Object.keys(data);
    var xdata = [];
    var ydata = [];
    
    var k = -1;
    for (var i=0; i<cols.length; i++) {
      if (cols[i] === 'Time') {
        xdata = data[cols[i]];
        for (var j=0; j<xdata.length; j++) {
          if (xdata[j].slice(3,5) !== '00') {
            //xdata[j] = "";
          }
        }
        //console.log(xdata);
      } else {
        k += 1;
        var yaxid = (cols[i].endsWith(']'))
            ? 'y-axis-2'
            : 'y-axis-0';

        var new_data = {
          label: cols[i],
          fill: false,
          data: data[cols[i]],
          borderColor: pltColors[k],
          backgroundColor: pltColors[k],
          lineTension: 0,
          yAxisID: yaxid
        };
        if (cols[i].endsWith(']')) {
          new_data.fill = true;
          new_data.fillOpacity = 0.2;
        }

        ydata.push(new_data);
      }
    }

  var config = {
      type: 'line',
      data: {
          labels: xdata,
          datasets: ydata
      },
      options: {
          responsive: true,
          animation : false,
          title:{
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
                      labelString: 'Time'
                  }
              }],
              yAxes: [{
                  position: "left",
                  "id": "y-axis-0"
                }, {
                  position: "right",
                  "id": "y-axis-2",
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



