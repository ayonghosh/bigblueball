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

/*
app.get('/clock', function(request, response) {
	response.sendFile('public/clock.html');
});
*/

/*
app.get('/names', function(req, res) {
    res.send([{name:'Natacha Atlas'}, {name:'Cyrine Abdelnour'}, {name:'Amr Diab'}]);
});
*/

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});

