var http=require('http');
var ns=require('node-static');
var WebSocketServer=require('ws').Server;

var port = process.env.PORT || 3000;
var sessions =[];
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
			for (var i = 0; i < sessions.length; i++) {			
				sessions[i].send(message);
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

