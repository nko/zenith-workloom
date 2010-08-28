require.paths.unshift("/home/node/.node_libraries");
require.paths.unshift("config");
require.paths.unshift("lib");

require('providers/user-mongodb');
require('providers/auth-mongodb');

var connect = require('connect'),
	form = require('connect-form'),
    assetManager = require('connect-assetmanager'),
    assetHandler = require('connect-assetmanager-handlers'),
    express = require('express'),
    MemoryStore = require('connect/middleware/session/memory'),
    log4js = require('log4js'),
    config = require('config-dev').config,
    auth = require('connect-auth'),
    loginStrategy = require('login-strategy'),
    //github = new require('providers/github').GitHub(),
    userProvider = new UserProvider(),
    authProvider = new AuthProvider();

log4js.addAppender(log4js.consoleAppender());
log4js.configure("./config/log4js-config.js");

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

var app = require('express').createServer(
        connect.conditionalGet(),
        connect.gzip(),
        connect.bodyDecoder(),
        connect.cookieDecoder(),
        connect.logger(),
        connect.session({ store: new MemoryStore() }),
        connect.staticProvider(__dirname + '/public'),
    	form({ keepExtensions: true }),
		connect.bodyDecoder(),
		connect.methodOverride(),
        auth([loginStrategy()])
	);

app.configure(function() {
  app.set('view engine', 'ejs');
  app.set('views', __dirname + '/views');
});

app.configure(function() {
  app.use(assets);
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

require('routes/auth').AuthRoutes.addRoutes(app, authProvider, userProvider);
require('routes/user').UserRoutes.addRoutes(app, authProvider, userProvider);

app.listen(config.port, '0.0.0.0');
logger.info("Server started on port " + config.port + "...");