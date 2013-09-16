var ws_host = window.location.href.replace(/(http|https)(:\/\/.*?)\//, 'ws$2');
var clients={};

var User= new function(){
    
    this.userid="unknown";        
    this.getUserid=function(){
        return this.userid;
    }
    this.setUserid=function(userid){
        this.userid=userid;
    } 
    
}

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

var Canvas = new function(){
       
    this.canvas=null;
    this.context=null;
    this.tool=null;
    
    this.init=function(){
        this.canvas=document.getElementById('myDrawing');
        this.context=this.canvas.getContext('2d');
        this.tool=new tool_pencil(this.context);       
    }  
    

    this.draw=function(data){
    if(clients[data.user]) {
        var func=this.tool[data.type];
        if(func){            
            this.context.strokeStyle=data.color;
            func(clients[data.user]._x,clients[data.user]._y,data._x,data._y);
        }
      }
      clients[data.user] = data;
    }    
};

var Server={
    
    connect:function(){     
    var wsc = new WebSocket(ws_host+'/socket');
    
        wsc.onopen= function() {
            wsc.send(Message.createMessage('userjoin',User.getUserid()));            
        };

        wsc.onmessage= function(message) {
            var parsed=Message.parseMessage(message.data);
            if(parsed.type=='chat'){
                $('#messages').prepend('<li>' + parsed.message + '</li>');
            }
            else if(parsed.type=='userjoin'){
                $('#messages').prepend('<li>' + parsed.message + ' has joined.</li>');                
            }
            else if(parsed.type=='userleave'){
                $('#messages').prepend('<li>' + parsed.message + ' has left.</li>');                
            }
            else if(parsed.type=='canvas'){
                Canvas.draw(parsed.message);                
            }
            else if(parsed.type=='update'){
                $('#currentUsers').text(parsed.message);				
            }
        };
        wsc.onclose= function() {            
        };
       return wsc;         
    },
    disconnect:function(wsc){
        wsc.send(Message.createMessage('userleave',User.getUserid()));
        wsc.close();
    }
   
};




$(document).ready(function() {                
    Canvas.init();
    var connected=false;
    var server;
    
    $('#messageText').keypress(function(event) {
       if ( event.which == 13 ) {
        var message = User.getUserid() + ': ' + $('#messageText').val();                    
        server.send(Message.createMessage('chat',message));
        $('#messageText').val('');  
       }                    
    });  
    
    // bind mouse events for canvas
    // mousedown
    $('#myDrawing').bind('mousedown',ev_canvas);
    //mousemove
    $('#myDrawing').bind('mousemove',ev_canvas);
    // mouseup
    $('#myDrawing').bind('mouseup',ev_canvas);

    // Mouse movement listener for canvas
    function ev_canvas(ev){
        var message={
            _x:ev.offsetX,
            _y:ev.offsetY,
            type:ev.type,
            color:'#'+$('#pencilColor').val(),
            user:User.getUserid()
            
        };
        server.send(Message.createMessage('canvas',message));
        
    }
    
    $('#clear').bind('click',function(){
        var message={
            type:'clear',
            user:User.getUserid()
            
        };
        server.send(Message.createMessage('canvas',message));   
    });
        
    
    $('#connect').bind('click',function(){
        
        if(!connected){
            
            if($('#userid').val()!=''){
                User.setUserid($('#userid').val());
            }
            server=Server.connect();                        
            $('#content'). css('display','block');
            $('#userid').attr("disabled", true);
            $('#connect').val('disconnect');
            connected=true;
            
        } else {            
            $("#userid").attr("disabled",false);
            $('#userid').val('');
            $('#connect').val('connect');
            Server.disconnect(server);
            User.setUserid('unknown');
            server=null;
            connected=false;
        }
    });
                
                
});

// This painting tool works like a drawing pencil which tracks the mouse 
// movements.
function tool_pencil (context) {
    var tool = this;
    this.started = false;
    

    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    
    this.mousedown = function () {
        tool.started = true;
    };
    

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (fromx,fromy,tox,toy) {
      if (tool.started) {
            context.beginPath();
            context.moveTo(fromx,fromy)
            context.lineTo(tox, toy);
            context.stroke();
          
     }
    };

    // This is called when you release the mouse button.
    
    this.mouseup = function () {
      if (tool.started) { 
            tool.started = false;
      }
    };
    

    this.clear = function(){
        context.clearRect(0,0,context.canvas.width,context.canvas.height);
    };
}

