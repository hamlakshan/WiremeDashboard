var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mqtt = require('mqtt');
var io = require('socket.io').listen(3001);
var mysql = require('mysql2');


//for mysql connection
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wireme'
});

//for user validation with my_sql
connection.connect(function (err) {
    if (err) {
        console.log("unable to connect to mysql server Error: " + err);
    } else {
        console.log("connected to mysql server successfully");

        //connection.end();
    }
});

//web sockets
io.sockets.on('connection', function (socket) {

    //for login function
    socket.on('login', function (login_info) {
        var this_user_name = login_info.user_name,
            this_user_password = login_info.user_password;

        if (this_user_name === '' || this_user_password === '') {
            socket.emit('alert', 'You must fill in both fields');
        } else {

            var mysql_query = 'SELECT * from user where user_name="' + this_user_name + '" and password="' + this_user_password + '"';
            connection.query(mysql_query, function (err, res, fields) {
                if (!err) {
                    var found = false;
                    if (res) {
                        for (var i = 0; i < 1; i++) {
                            if (res[i].user_name === this_user_name) {
                                found = true;

                                if (res[i].password === this_user_password) {
                                    //get the user relevant widget data from the mysql database
                                    mysql_query = 'Select user_id, widget_name, widget_title, parameter from user_widget natural join widget where user_id=' + res[i].user_id;
                                    //console.log("query is: "+mysql_query);
                                    connection.query(mysql_query, function (err, rows, fields) {
                                        if (!err) {
                                            if (rows.length > 0) {
                                                console.log(rows);
                                                socket.emit('valid', rows);
                                            } else {
                                                console.log("no widgets defined");
                                            }
                                        } else {
                                            console.log("unable to read the user specific widget details");
                                        }
                                    });

                                } else {
                                    socket.emit('alert', 'Please retry password');
                                }
                                //  break;
                            }
                        }
                        if (!found) {
                            socket.emit('alert', 'Sorry, could not find you. Please sign up.');
                            //  socket.emit('redirect', 'about');
                        }
                    }
                } else {
                    console.log('Error while reading database: ' + err);
                }

            });

        }
    });
});


//subscribe to the mqtt broker

var option = {
    clientId: 'WebSite'
};

var client = mqtt.connect('mqtt://localhost' + '', option);

client.on('connect', function () {
    client.subscribe('user_id');

    client.on('message', function (topic, message) {
        //when message received socket will emit message to the front end
        io.sockets.emit('mqtt', {
            'topic': String(topic),
            'payload': JSON.parse(message)["temp_sensor"]
        });
        console.log(JSON.parse(message));
        // client.end();
    });


});


var index = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var about = require('./routes/about');


var app = express();

app.locals.gage_value = "20";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/login', login);
app.use('/about', about);

app.post('/publish', function (req, res) {

    // console.log("request form hub is" +JSON.stringify(req.body));
    res.send(req.body);

});


//handling the jason form the VPT
var post_req = {
    "username": "dulaj",
    "password": "admin",
    "widgets": [{
        "indexInLibrary": 1,
        "spriteInfo": {},
        "visible": true,
        "objName": "node-mcu",
        "direction": 90,
        "scale": 0.5,
        "currentCostumeIndex": 0,
        "scripts": [[55,
            117,
            [["node-mcu.runArduino"],
                ["node-mcu.configWifi", "name", "password"],
                ["doForever", [["node-mcu.sendToServer", ["node-mcu.getDHT", "1"], "\/temp"]]]]]],
        "scratchX": -3,
        "isDraggable": false,
        "scratchY": 4,
        "costumes": [{
            "bitmapResolution": 1,
            "rotationCenterY": 0,
            "baseLayerMD5": "node-mcu.png",
            "costumeName": "node mcu",
            "rotationCenterX": 0,
            "baseLayerID": -1
        }],
        "rotationStyle": "normal"
    },
        {
            "indexInLibrary": 2,
            "scratchY": -6,
            "visible": true,
            "objName": "line_chart",
            "direction": 90,
            "scale": 1,
            "currentCostumeIndex": 0,
            "scripts": [[65, 66, [["initWidget"], ["setWidgetName", "temperature line chart"], ["sendDataToWidget", "\/temp1"]]]],
            "spriteInfo": {},
            "scratchX": -17,
            "isDraggable": false,
            "sounds": [{
                "sampleCount": 258,
                "soundID": -1,
                "soundName": "pop",
                "md5": "83a9787d4cb6f3b7632b4ddfebf74367.wav",
                "rate": 11025,
                "format": ""
            }],
            "costumes": [{
                "bitmapResolution": 1,
                "rotationCenterY": 81,
                "baseLayerMD5": "8d508770c1991fe05959c9b3b5167036.gif",
                "costumeName": "amon",
                "rotationCenterX": 87,
                "baseLayerID": -1
            }],
            "rotationStyle": "normal"
        },
        {
            "indexInLibrary": 3,
            "scratchY": -8,
            "visible": true,
            "objName": "google gauge",
            "direction": 90,
            "scale": 1,
            "currentCostumeIndex": 0,
            "scripts": [[13, 50, [["initWidget"], ["setWidgetName", "humidity gauge"], ["sendDataToWidget", "\/humidity"]]]],
            "spriteInfo": {},
            "scratchX": -16,
            "isDraggable": false,
            "sounds": [{
                "sampleCount": 258,
                "soundID": -1,
                "soundName": "pop",
                "md5": "83a9787d4cb6f3b7632b4ddfebf74367.wav",
                "rate": 11025,
                "format": ""
            }],
            "costumes": [{
                "bitmapResolution": 1,
                "rotationCenterY": 81,
                "baseLayerMD5": "8d508770c1991fe05959c9b3b5167036.gif",
                "costumeName": "amon",
                "rotationCenterX": 87,
                "baseLayerID": -1
            }],
            "rotationStyle": "normal"
        }]
};

function set_widgets( ) {

    var name = post_req.username;
    var widget_type, widget_title, widget_parmeter, widget_id;
    var password = post_req.password;
    var mysql_query = 'SELECT user_id from user where user_name="' + name + '" and password="' + password + '"';

    connection.query(mysql_query, function (err, rows, fields) {
        if (!err) {
            if (rows.length == 1) {
                var user_id = rows[0].user_id;

                for (var i = 1; i < post_req.widgets.length; i++) {

                    widget_type=post_req.widgets[i].objName;
                    widget_parmeter=post_req.widgets[i].scripts[0][2][2][1];
                    widget_title=post_req.widgets[i].scripts[0][2][1][1];
                    console.log(widget_title);

                    connection.query('Select widget_id From widget Where widget_name="'+widget_type+'"', function (err, rows, fields) {
                        if(!err){
                            widget_id=rows[0].widget_id;
                            console.log('INSERT INTO user_widget (user_id, widget_id,parameter,widget_title) values ('+user_id+','+widget_id+',"'+widget_parmeter+'","'+widget_title+'")');
                            connection.query('INSERT INTO user_widget (user_id, widget_id,parameter,widget_title) values ('+user_id+','+widget_id+',"'+widget_parmeter+'","'+widget_title+'")' ,function(err){
                                if(err){
                                    console.log("Error while writing to the table");
                                }
                            });

                        }else {
                            console.log('error wile reading widget_id');
                        }
                    });

                }


            } else {
                console.log("no or more matching fields");
            }

        } else {
            console.log("Error while matching user name and password ")
        }
    });
}

set_widgets();

//mqtt part


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
