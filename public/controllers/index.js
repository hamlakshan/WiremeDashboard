var g1;
window.onload = function () {

    if (sessionStorage.getItem('ss_user_name') == null) {
//redirect to page
         window.location.href="http://localhost:3000/login";
    }

    g1 = new JustGage({
        id: "g1",
        title: "Temperature reading",
        value: 72,
        min: 0,
        max: 50,
        gaugeWidthScale: 0.6,
        counter: true,
        titleFontColor: "green",
        titleFontFamily: "Georgia",
        titlePosition: "below",
        valueFontColor: "blue",
        valueFontFamily: "Georgia"
    });

    var val;
    var socket = io.connect('http://localhost:3001');
    socket.on('connect', function () {
        socket.on('mqtt', function (msg) {
            val=msg.payload ;
            document.getElementById('gage').innerHTML = 'Temperature' + ' ' + val + " ";
            g1.refresh(val);
            line1.append(new Date().getTime(),val );

        });

    });

};

window.onunload = function () {
    sessionStorage.clear();
};

