var twit = require( 'twit' ),
	irc = require( 'irc' ),
	rss = require( 'feed-poll' )( [ 'http://www.reddit.com/r/all/new/.rss' ] ),
	colors = require( 'colors' ),
	nconf = require( 'nconf' );

nconf.file( { file: __dirname + '/creds.json' } ); 

var creds = nconf.get( 'twitter' );

var twitter = new twit( creds );
var irc_client = new irc.Client( 'irc.freenode.net', 'shiftysnifty', {
	channels: [ '#devious' ]
});

function gather_data( type, obj ) {
	var msg = '';
	var color = 'red';

	if ( type === 'tweet' ) {
		msg = obj.text;
		color = 'cyan';
	}

	if ( type === 'irc' ) {
		msg = obj.msg;
		color = 'blue';
	}

	if ( type === 'rss' ) {
		msg = obj.content;
		color = 'green';
	}

	console.log( "new data from '%s': %s", type[color], msg );
}

twitter.stream( 'statuses/filter', { track: 'twss' }, function( str ) {
	str.on( 'tweet', function( tw ) {
		gather_data( 'tweet', tw );
	});
});

rss.on( 'article', function( article ) {
	if ( article.content.match( /twss/i ) ) {
		gather_data( 'rss', article );
	}
});
rss.start();

irc_client.addListener( 'message', function( from, to, msg ) {
	if ( msg.match( /twss/i ) ) {
		gather_data( 'irc', { from: from, to: to, msg: msg } );
	}
});
