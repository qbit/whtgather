var twit = require( 'twit' ),
	data_source = {
		twitter: 'twss',
		irc: { 
			server: 'irc.freenode.net',
			channels: [ '#devious' ],
			nick: 'shiftysnifty'
		},
		rss: [ 'http://www.reddit.com/r/all/new/.rss' ]
	},
	irc = require( 'irc' ),
	rss = require( 'feed-poll' )( data_source.rss ),
	colors = require( 'colors' ),
	nconf = require( 'nconf' );

nconf.file( { file: __dirname + '/creds.json' } ); 

var creds = nconf.get( 'twitter' );

var twitter = new twit( creds );
var irc_client = new irc.Client( data_source.irc.server, data_source.irc.nick, {
	channels: data_source.irc.channels
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

	/*
	 * This is where you would further refine the data.. blow away html
	 * elements.. save meta information ( long / lat for example ), and
	 * do general info cleanup.
	 *
	 */

	console.log( "new data from '%s': %s", type[color], msg );
}

twitter.stream( 'statuses/filter', { track: data_source.twitter }, function( str ) {
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
