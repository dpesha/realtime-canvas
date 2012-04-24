var http=require('http');
var ns=require('node-static');
var WebSocketServer=require('ws').Server;

var port = process.env.PORT || 3000;
var sessions =[];
var users=[];
var file=new(ns.Server)("./public");
	var app=module.exports=http.createServer(function(request, response){
		request.addListener('end',function(){
		file.serve(request,response);
		});
	}).listen(port, function() {
		console.log("Listening on " + port);
	});
	var wss = new WebSocketServer({server:app,path:'/socket'});
	wss.on('connection', function(ws) {
		console.log("new client connected!");
		sessions.push(ws);
		ws.on('message', function(message) {
			console.log('received: %s', message);
			var mesg=JSON.parse(message);
			
			if(mesg.type=='userjoin'){
			   users.push(mesg.message);
			}			
			else if(mesg.type=='userleave'){
			    for(var i=0;i<users.length;i++){
				if(users[i]==mesg.message){
					users.splice(i,1);
				}
			    }
			}			
			
			for (var i = 0; i < sessions.length; i++) {			
				sessions[i].send(message);
				sessions[i].send("{\"type\":\"update\",\"message\":\"" + users.join() + "\"}");
			}
		});
		ws.on('close',function(){
			console.log("client disconnected");
			for (var i = 0; i < sessions.length; i++) {
				if(sessions[i]==ws){
					sessions.splice(i,1);
				}
			}
		});
		
	});

