var Message= {
    createMessage:function(type,message){
        var msg={
          type: type,
          message:message
        };
        return JSON.stringify(msg);
    },
    parseMessage:function(message){
        return JSON.parse(message);
    }
};

$(document).ready(function() {
    
                var canvas=document.getElementById("myDrawing");
                var context=canvas.getContext('2d');
                var tool=new tool_pencil(context);
                
                var wsc = new WebSocket("ws://localhost:8080/"); 
                
                wsc.onopen= function() {
                    $('#messages').prepend('<li>Connected to the server.</li>');
                };

                wsc.onmessage= function(message) {
                    var parsed=Message.parseMessage(message.data);
                    if(parsed.type=='chat'){
                        $('#messages').prepend('<li>' + parsed.message + '</li>');
                    }
                    else if(parsed.type=='canvas'){
                        var func=tool[parsed.message.type];
                        if(func){
                            func(parsed.message._x,parsed.message._y);
                        }
                    }
                };

                wsc.onclose= function() {
                    $('#messages').prepend('<li>Disconnected from the server.</li>');
                };

                $('#messageText').keypress(function(event) {
                   if ( event.which == 13 ) {
                    var message = $('#messageText').val();                    
                    wsc.send(Message.createMessage('chat',message));
                    $('#messageText').val('');  
                   }                    
                });        
                
                
                // bind mouse events
                $('#myDrawing').bind('mousedown',ev_canvas);                
                $('#myDrawing').bind('mousemove',ev_canvas);
                $('#myDrawing').bind('mouseup',ev_canvas);
                
                
                function ev_canvas(ev){
                    var message={
                        _x:ev.offsetX,
                        _y:ev.offsetY,
                        type:ev.type
                    };
                    wsc.send(Message.createMessage('canvas',message));
                }  
                
                
});

 // This painting tool works like a drawing pencil which tracks the mouse 
  // movements.
  function tool_pencil (context) {   
    var tool = this;
    this.started = false;

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (x,y) {
        context.beginPath();
        context.moveTo(x, y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (x,y) {
      if (tool.started) {
        context.lineTo(x, y);
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (x,y) {
      if (tool.started) {
        tool.mousemove(x,y);
        tool.started = false;
      }
    };
  }

