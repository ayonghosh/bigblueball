var express = require("express");

var app = express();
app.use(express.logger());
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));
app.use('/resources', express.static('public/resources'));
app.use('/', express.static('public/'));

app.get('/', function(request, response) {
	response.sendfile('public/index.html');
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});

