require.paths.unshift("/home/node/.node_libraries");
require.paths.unshift("config");
require.paths.unshift("lib");

require('providers/user-mongodb');
require('providers/twitter-mongodb');
require('providers/github');

var sys = require('sys'),
  connect = require('connect'),
  form = require('connect-form'),
  assetManager = require('connect-assetmanager'),
  assetHandler = require('connect-assetmanager-handlers'),
  express = require('express'),
  MemoryStore = require('connect/middleware/session/memory'),
  log4js = require('log4js'),
  config = require('config-dev').config,
  auth = require('connect-auth'),
  userProvider = new UserProvider(),
  twitterProvider = new TwitterProvider(),
  authProvider = require('providers/auth-mongodb').AuthProvider,
  githubProvider = new GitHub();

log4js.addAppender(log4js.consoleAppender());
log4js.configure("./config/log4js-config.js");

var logger = log4js.getLogger("MAIN");
logger.debug(sys.inspect(config));

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
      //'reset.css'
      //, 'client.css'
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
  authProvider.auths
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
    layout : false,
    locals : {

    }
  });
});

app.get('/github', function(req, res) {
  var user = userProvider.getCurrentUser(req), cred;
  if(!user) {
    res.redirect("/auth");
  }
  else {  
    githubProvider.getNkoRepoitoriesCommits(function(error, result) {
      if(error) {
        logger.error(error);
        res.redirect("/auth?mc=github");
      }
      else {
        res.send(result);
      }
    })
  }
});

app.post('/', function(req, res) {
  console.log(req.body);
  res.send('post');
});

var lastChangedCss = 0;
app.get('/reload/', function(req, res) {
  var reloadCss = lastChangedCss;
  (function reload() {
    setTimeout(function () {
      if (reloadCss < lastChangedCss) {
        res.send('reload');
        reloadCss = lastChangedCss;
      } else {
        reload();
      }
    }, 100);
  })();
});

app.get("/test", function(req, res) {
  refreshData();
});

app.get("/logout", function(req, res) {
  authProvider.logout(req);
  userProvider.logout(req);
  res.redirect("/");
});

authProvider.addRoutes(app, userProvider);
require('routes/auth').AuthRoutes.addRoutes(app, authProvider);
require('routes/user').UserRoutes.addRoutes(app, authProvider, userProvider);
app.set("home", "/user");

//THIS GOES AWAY

var REFRESHING = false;
function refreshData() {
  if(REFRESHING) {
    logger.warn("Attempted to refresh while a refresh was under way... cancelling.");
    return;
  }
  logger.debug("Refreshing user data...");
  userProvider.getAllUsers(function(error, result) {
    if(error || !result) {
      logger.error(error.message);
      return;
    }
    REFRESHING = true;
    for(var i = 0; i < result.length; i++) {
      var user = result[i], cred = twitterProvider.getTwitterCreds(user);

      if(cred) {
        twitterProvider.getWeekTweets(cred, function(error, tweets) {
          logger.debug("Getting Tweets for user " + cred.name);

          if(!user.actions) {
            user.actions = {};
          }

          user.actions.tweets = tweets;
          userProvider.save(user, function(error, user) {
            if(i >= result.length) {
              REFRESHING = false;
            }
          });
        });
      }
    }
  });
}

setInterval(refreshData, 600000);

app.listen(config.port, '0.0.0.0');
logger.info("Server started on port " + config.port + "...");