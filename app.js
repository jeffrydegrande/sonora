var app = require('express').createServer(),
    io = require('socket.io').listen(app),
    config = require('./config'),
    amqp = require('amqp');

process.on('uncaughtException', function (error) {
    console.log(error);
    console.log(error.stack);
});

app.listen(config.port);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/html/index.html');
});

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



