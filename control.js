var http = require('http');
var express = require('express');
var socket = require('socket.io');
var  path = require('path');



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get('port'), function(){
  var msg = 'Express server start on http://localhost:' + app.get('port');
  console.log(msg);
});

var io = socket.listen(server);

app.get('/index.html', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

app.get('/controller.html', function(req, res){
  res.sendfile(__dirname + '/controller.html');
});

app.get('/gyro.html', function(req, res){
  res.sendfile(__dirname + '/gyro.html');
});

app.get('/cordova-2.0.0.js', function(req, res){
  res.sendfile(__dirname + '/cordova-2.0.0.js');
});

var nextId = 0;
var display;
var sockets = [];

io.sockets.on('connection', function(socket){

  socket.on('init', function(data){
    if(data === 0){
      display = socket;
    }
    else{
      sockets[nextId] = socket;
      sockets[nextId].emit('ID', nextId);
      display.emit('newController', nextId);
      nextId++;
    }
  });

  socket.on('input', function(input){
    display.emit('update', input);
  });

  socket.on('disconnect', function(){
    var socketIndex = sockets.indexOf(socket);

    display.emit('destroy', socketIndex);
    console.log("DESTROY: " + socketIndex);
    sockets.splice(socketIndex, 1);
  });

});
