var socket = io();
$('#messageSend').focus()

socket.on('connect', function(){
    console.log('Connected to server');
});

socket.on('message', function(message){
    console.log('New message: ' + message);
    $('#messages').append('<div class="message-item  w-50 receive"><div class="profile-img">     <img src="https://via.placeholder.com/150" class="img-fluid rounded-circle float-left" alt="">'+
    '</div><div class="message-content"><div class="message-title">'
     +'    <strong>'+message['from'] +'</strong>'+ 
     + '</div><div class="message-body">' + 
     message['text'] + 
     '</div></div></div>');
});

function sendMessage() {
    $('#messages').append('<div class="message-item  w-50 send"><div class="profile-img">     <img src="https://via.placeholder.com/150" class="img-fluid rounded-circle float-left" alt="">'+
    '</div><div class="message-content"><div class="message-title">'
     +'    <strong>'+$('#userName').val()+'</strong>'+ 
     + '</div><div class="message-body">' + 
     document.getElementById('messageSend').value+ 
     '</div></div></div>');

     socket.emit('Message', {
        'from': $('#userName').val(),
        'text':$('#messageSend').val()
    });
}
$('#messageSend').on('keypress', function(e){
    if(e.key == 'Enter'){
        sendMessage()        
        document.getElementById('messageSend').value = '';
    }
});