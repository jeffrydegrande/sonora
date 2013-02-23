var https = require('https');
var config = require('./config'), fs = require('fs');

var app = require('express').createServer({
        key: fs.readFileSync(config.ssl.key).toString(),
        cert: fs.readFileSync(config.ssl.cert).toString(),
        ca: fs.readFileSync(config.ssl.ca).toString(),
    }),
    io = require('socket.io').listen(app),
    amqp = require('amqp');

process.on('uncaughtException', function (error) {
    console.log(error);
    console.log(error.stack);
});

app.listen(config.port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/html/index.html');
});

io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging

var sonora = {};

sonora.io = io.of('/sonora').on('connection', function (socket) {
    socket.on('subscribe', function (queues) {
        for(q=0; q < queues.length; q++)
            socket.join(queues[q]);
    });
    socket.on('unsubscribe', function (queues) {
        for(q=0; q < queues.length; q++)
            socket.leave(queues[q]);
    });
});

sonora.rabbitmq = amqp.createConnection({ host: config.rabbitmq.host });
sonora.rabbitmq.on('ready', function () {
    sonora.rabbitmq.queue(config.rabbitmq.queue, {arguments: {'x-message-ttl':config.rabbitmq.ttl}}, function(q){
        q.bind('#');
        q.subscribe(function (message) {
            var data = {
                data: message.data,
                event: message.event ? message.event : 'pulse'
            };
            if (message.options && message.options.broadcast)
                sonora.io.emit(message.event ? message.event : 'pulse', data);
            else 
                for(r = 0; r < message.receivers.length; r++) {
                    sonora.io.in(message.receivers[r]).emit(message.event ? message.event : 'pulse', data);
                }
        });
    });
});



