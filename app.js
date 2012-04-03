var app = require('express').createServer()
  , io = require('socket.io').listen(app);

app.listen(80);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/html/index.html');
});

var sono = io.of('/sono')
	.on('connection', function (socket) {
  		socket.on('listen', function (concert) {
  			socket.join(concert);
  		});
  	});



var nora = io.of('/nora')
	.on('connection', function (socket) {
  		socket.on('perform', function (data) {
    		sono.in(data.concert).emit(data.band, data.song);
  		});
	});



