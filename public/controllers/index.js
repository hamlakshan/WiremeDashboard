var g1;
var google_chart;
var google_gauge_Data;
var lineChart;

//the main controlling function
window.onload = function () {

   // alert("details are  " + sessionStorage.getItem('ss_widgets'));

    if (sessionStorage.getItem('ss_user_id') == null) {
//redirect to page
         window.location.href="http://localhost:3000/login";
    }
    var widget_details=JSON.parse(sessionStorage.ss_widgets);
    google.charts.load('current', {'packages':['gauge']});

    //alert(widget_details.length);

    for(var i=0; i<widget_details.length; i++){
        if(widget_details[i].widget_name=="google gauge"){
            document.getElementById("widget_google_gauge").style.display= "block";
            google.charts.setOnLoadCallback(drawGoogleGauge);

        }else if(widget_details[i].widget_name=="line_chart"){

            document.getElementById("widget_line_chart").style.display= "block";
            drawLineChart();

        }else if(widget_details[i].widget_name=="bar_chart"){

        }else if(widget_details[i].widget_name=="normal_gauge"){

            document.getElementById("widget_gauge").style.display= "block";
            drawGauge(100);
        }
    }
    var val;
    var socket = io.connect('http://localhost:3001');

    //when a response is received from the web server over web sockets
    socket.on('connect', function () {
        //when conecte to web sockets all the charts will be initialized and drawn



        socket.on('mqtt', function (msg) {
            val =msg.payload[0].value;
            document.getElementById('gage').innerHTML = val;
            //refresh the gauges
            g1.refresh(val);
            //google gauge
            google_gauge_Data.setValue(0,1,val);
            google_chart.draw(google_gauge_Data, options);
            //smoothy chart
            lineChart.append(new Date().getTime(),val );

        });
    });

};


//function to draw the regular gauge
function drawGauge(range){
    g1 = new JustGage({
        id: "g1",
        title: "Temperature reading",
        value: 5,
        min: 0,
        max: range,
        gaugeWidthScale: 0.6,
        counter: true,
        titleFontColor: "green",
        titleFontFamily: "Georgia",
        titlePosition: "below",
        valueFontColor: "blue",
        valueFontFamily: "Georgia"
    });
}

//to draw the google gauge
function drawGoogleGauge() {
    var options = {
        width: 400, height: 120,
        redFrom: 90, redTo: 100,
        yellowFrom:75, yellowTo: 90,
        minorTicks: 5
    };

    google_gauge_Data = google.visualization.arrayToDataTable([
        ['Label', 'Value'],
        ['Temperature', 53],
    ]);
    google_chart = new google.visualization.Gauge(document.getElementById('chart_div'));

    google_chart.draw(google_gauge_Data, options);
}


//to draw the smoothie line chart
function drawLineChart(){
    var smoothie = new SmoothieChart({
        grid: {
            strokeStyle: 'rgb(255,255,255)', fillStyle: 'rgb(255, 255, 255)',
            lineWidth: 1, millisPerLine: 250, verticalSections: 10,
        },
        labels: {fillStyle: 'rgb(100, 0, 0)'}
    });
    smoothie.streamTo(document.getElementById("linechart"))
    lineChart = new TimeSeries();
    lineChart.append(new Date().getTime(), 10);
    smoothie.addTimeSeries(lineChart,
        {strokeStyle: 'rgb(0, 255, 0)', fillStyle: 'rgba(255, 255, 255, 0.4)', lineWidth: 3}
    );
}


function include(destination) {
    alert("include");
    var e=window.document.createElement('script');
    e.setAttribute('src',destination);
    window.document.body.appendChild(e);
}

//to remove the created session

//window.onunload = function () {
//    sessionStorage.clear();
//};