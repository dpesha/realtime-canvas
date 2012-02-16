var http=require('http');
var content='<html><body><p>hellow world</p><script type="text/javascript">alert("hi");</script></body></html>';
var port = process.env.PORT || 3000;

	http.createServer(function(request, response){
		response.end(content);
	}).listen(port, function() {
  console.log("Listening on " + port)});

// TODO: deploy node into heroku, cloudfoundry, joyent