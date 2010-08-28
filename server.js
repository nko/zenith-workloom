require.paths.unshift("/home/node/.node_libraries");
require.paths.unshift("./lib/providers");
require('user-mongodb');

var connect = require('connect'),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    express = require('express'),
    MemoryStore = require('connect/middleware/session/memory'),
    log4js = require('log4js'),
    userProvider = new UserProvider();

log4js.addAppender(log4js.consoleAppender());
log4js.configure("./config/log4js.js");

var logger = log4js.getLogger("MAIN");

process.title = 'zenith-workloom';
process.addListener('uncaughtException', function (err, stack) {
	console.log('Caught exception: ' + err);
	console.log(err.stack.split('\n'));
});

var assets = assetManager({
	'js': {
		'route': /\/static\/js\/[0-9]+\/.*\.js/
		, 'path': './public/js/'
		, 'dataType': 'js'
		, 'files': [
			'jquery.js'
			, 'jquery.client.js'
			, 'jquery.reload.js'
		]
		, 'preManipulate': {
			'^': []
		}
		, 'postManipulate': {
			'^': [
				assetHandler.uglifyJsOptimize
			]
		}
	}, 'css': {
		'route': /\/static\/css\/[0-9]+\/.*\.css/
		, 'path': './public/css/'
		, 'dataType': 'css'
		, 'files': [
			'reset.css'
			, 'client.css'
		]
		, 'preManipulate': {
			/*'MSIE': [
				assetHandler.yuiCssOptimize
				, assetHandler.fixVendorPrefixes
				, assetHandler.fixGradients
				, assetHandler.stripDataUrlsPrefix
				, assetHandler.fixFloatDoubleMargin
			]
			, */
			'^': [
				 assetHandler.fixVendorPrefixes
				, assetHandler.fixGradients
				, assetHandler.replaceImageRefToBase64(__dirname + '/public')
			]
		}
		, 'postManipulate': {
			'^': [
				function (file, path, index, isLast, callback) {
					// Notifies the browser to refresh the CSS.
					// This enables coupled with jquery.reload.js 
					// enables live CSS editing without reload.
					callback(file);
					lastChangedCss = Date.now();
				}
			]
		}
	}
});

var app = module.exports = express.createServer();

app.configure(function() {
	app.set('view engine', 'ejs');
	app.set('views', __dirname + '/views');
});

app.configure(function() {
	app.use(connect.conditionalGet());
	app.use(connect.gzip());
	app.use(connect.bodyDecoder());
	app.use(connect.logger());
	app.use(assets);
	app.use(connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function() {
	app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.dynamicHelpers({
	cacheTimeStamps: function(req, res) {
		return assets.cacheTimestamps;
	}
});

app.get('/', function(req, res) {
	res.render('index', {
		locals: {
			'date': new Date().toString()
		}
	});
});

app.post('/', function(req, res) {
	console.log(req.body);
	res.send('post');
});

var lastChangedCss = 0;
app.get('/reload/', function(req, res) {
	var reloadCss = lastChangedCss;
	(function reload () {
		setTimeout(function () {
			if ( reloadCss < lastChangedCss) {
				res.send('reload');
				reloadCss = lastChangedCss;
			} else {
				reload();
			}
		}, 100);
	})();
});

app.listen(3000);
logger.info("Server started on port 3000...");