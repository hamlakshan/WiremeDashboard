var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mqtt = require('mqtt');
var io = require('socket.io').listen(3001);
var mongo = require('mongodb').MongoClient;

//mongo db for user authentication
mongo.connect('mongodb://127.0.0.1/wireme', function (err, db) {

    if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
        console.log("Connected to mongoDB successfully!");

        io.sockets.on('connection', function (socket) {

            //for login function
            socket.on('login', function (login_info) {
                var this_user_name = login_info.user_name,
                    this_user_password = login_info.user_password;

                if (this_user_name === '' || this_user_password === '') {
                    socket.emit('alert', 'You must fill in both fields');
                } else {
                    var users = db.collection('users');
                    users.find().toArray(function (err, res) {
                        if (err) throw err;

                        var found = false,
                            location = -1;

                        if (res.length) {
                            for (i = 0; i < res.length; i++) {
                                if (res[i].user_name === this_user_name) {
                                    found = true;

                                    if (res[i].password === this_user_password) {
                                       // socket.emit('alert', 'Login successful');
                                        socket.emit('redirect', 'http://localhost:3000/');
                                    } else {
                                        socket.emit('alert', 'Please retry password');
                                    }
                                    break;
                                }
                            }

                            if (!found) {
                                socket.emit('alert', 'Sorry, could not find you. Please sign up.');
                              //  socket.emit('redirect', 'about');
                            }
                        }
                    })
                }
            });


        });
    }
});


//subscribe to the mqtt broker

var option = {
    clientId: 'WebSite'
};

var client = mqtt.connect('mqtt://192.168.88.100' + '', option);

client.on('connect', function () {
    client.subscribe('user_id');

    client.on('message', function (topic, message) {
        //when message received socket will emit message to the front end
        io.sockets.emit('mqtt', {
            'topic': String(topic),
            'payload': JSON.parse(message)["1"]
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
