//nodejs expres server with websocket
var express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('Message', function(msg){
        console.log('message: ' );
        socket.broadcast.emit('message', msg);
    });
    socket.on('call',function (call) {
        console.log('call: ' );
        socket.broadcast.emit('call', call);
    })
    socket.on('callOut', function(callOut){
        socket.broadcast.emit('callOut',callOut)
    })
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


app.get('/', function(req, res){
    res.sendFile(__dirname + '/home.html')
    } 
)

//server static with express
app.use('/static',express.static('public'));

server.listen(3000, function(){
    console.log('listening on *:3000');
});
