var Twit = require( 'twit' ),
	irc = require( 'irc' ),
	rss = require( 'rssee' ),
	sqlite = require( 'sqlite3' ),
	url = require('url'),
	fs = require('fs'),
	nconf = require( 'nconf' ),
	io = require('socket.io'),
	http = require( 'http' ),
	server;

nconf.file( { file: __dirname + '/creds.json' } ); 

var creds = nconf.get( 'twitter' );

var t = new Twit( creds );

server = http.createServer(function(req, res){
	var path = url.parse(req.url).pathname;
	switch (path){
		case '/':
			fs.readFile(__dirname + '/twit.html', function(err, data){
				if (err) return send404(res);
				res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
				res.write(data, 'utf8');
				res.end();
			});
			break;

		default: send404(res);
	}
}),

send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};

server.listen(8337);

var io = io.listen(server), 
	buffer = [];

var tmp_buffer = [];

io.on('connection', function(socket){
	var i,l;
	for ( i = 0, l = tmp_buffer.length; i < l; i++ ) {
		socket.emit( 'message', { data: tmp_buffer[i] } );
	}

	setInterval( function() {
		var item = buffer.length -1;
		if ( buffer[ item ] ) {
			var msg = { data: buffer[ item ] };
			socket.emit( 'message', msg );
			if ( buffer.length < 50 ) {
				tmp_buffer.push( buffer.shift() );
			} else {
				tmp_buffer.shift();
				tmp_buffer.push( buffer.shift() );
			}
		}
	}, 100);
});

t.stream( 'statuses/filter', { track: 'wss' }, function( str ) {
	str.on( 'tweet', function( tw ) {
	});
});
