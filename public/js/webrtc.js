const { FaceDetectionNet } = require("face-api.js");

const localVid = document.getElementById('local');
const remoteVid = document.getElementById('remote');
var peers = {};
var userName = document.getElementById('userName').value;
var userCall = document.getElementById('userCall').value;
var localStream = null;
var remoteStream = null;
var peer=null;
// var signalsocket = new WebSocket('ws://localhost:8000/ws/chat/signal/');
var signalsocket = io();

function makeCall() {
    //init getusermedia
    navigator.mediaDevices.getUserMedia({
        // audio: false,
        audio: true,
        video:true
    }).then(function(stream) {
        localStream = stream
        localVid.srcObject = localStream;
        localVid.play();
    }).catch(function(err) {
        console.log('getUserMedia() error: ', err);
    }).then(function(stream) {
        console.log(stream)
    //init simplepeer 
    peer = new SimplePeer({
        initiator: true,
        stream: localStream,
        trickle: false
        });
        peer.on('signal', function(data) {
            if(data['type']=='offer') {
            // alert('send emit offer')
            signalsocket.emit('call',JSON.stringify({
                'user': userName,
                'userdest': userCall,
                'message': data,
            }));
            }
        }
        );
        peer.on('connect', function() {
            console.log('CONNECT');
        });
        peer.on('data', function(data) {
            console.log('DATA: ' + data);
        });
        peer.on('stream', function(stream) {
            console.log(stream)
            remoteVid.srcObject = stream;
            remoteVid.play();
            $('#local').css('display', 'block');
            $('#remote').css('display', 'block');
        });
});
}

function receiveCall(data) {
    //init getusermedia
    navigator.mediaDevices.getUserMedia({
        // audio: false,
        audio: true,
        video: true
    }).then(function(stream) {
        localStream = stream;
        localVid.srcObject = stream;
        localVid.play();
        //init simplepeer
    peer = new SimplePeer({
        initiator: false,
        stream: localStream,
        trickle: false
    });
    // peer.signal(JSON.stringify(data['message']));
    peer.signal(data['message']);
    //peer stream on
    peer.on('signal', function(signal) {
        if (signal['type'] == 'answer') {
            signalsocket.emit('call',JSON.stringify({
                'user': data['user'],
                'message': signal,
                'userdest': data['userdest'],
            }));                
        }
    });
    peer.on('connect', function() {
        console.log('CONNECT');
    }
    );
    peer.on('data', function(data) {
        console.log('DATA: ' + data);
    }
    );
    peer.on('stream', function(stream) {
        console.log(stream)
        remoteVid.srcObject = stream;
        remoteVid.play();
        $('#local').css('display', 'block');
        $('#remote').css('display', 'block');

    }
    );
    }).catch(function(err) {
        console.log('getUserMedia() error: ', err);
    });

}

$('#userName').change(function() {
    userName = $('#userName').val();
});
$('#userCall').change(function() {
    userCall = $('#userCall').val();
});

$('#closecall').on('click',function stopBothVideoAndAudio() {
    alert('clicked')
    localStream.getTracks().forEach(function(track) {
        if (track.readyState == 'live') {
            track.stop();
        }
        signalsocket.emit('callOut',JSON.stringify({
            'message': 'callOut',
    }));
});
});

signalsocket.onopen = function() {
    console.log('Connected to signaling server');
};
// When we got a message from a signaling server
signalsocket.on('call',  function(event) {
    console.log(event)
    var data = JSON.parse(event);
    if (data['userdest'] == userName && data['message']['type']=='offer') {
    console.log('to remote')
    console.log(data['userdest'])
    console.log(data['message'])
    //pause execution
    var call = confirm('call from '+data['user']) 
    $('#receiveCall').click();
    call ? receiveCall(data) : null;
} 
    else if(data['user']==userName && data['message']['type']=='answer' ){
        console.log('to local')
        console.log(data['user'])
        console.log(data['message'])
        peer.signal(data['message'])
    }

    else{
        console.log('nothing')
    }
});

signalsocket.on('callOut',function (event) {
    if(JSON.parse(event)['message']=='callOut'){
        $('#closeCall').click();
    }})