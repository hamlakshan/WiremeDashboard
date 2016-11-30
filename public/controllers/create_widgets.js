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

