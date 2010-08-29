var sys = require("sys"),
  Db = require('mongodb/db').Db,
  Server = require('mongodb/connection').Server,
  log4js = require('log4js'),
  connect = require('connect'),
  express = require('express'),
  auth = require('connect-auth'),
  OAuth = require('oauth').OAuth,
  config = require('config-dev').config;

log4js.configure("./config/log4js-config.js");
var logger = log4js.getLogger("AUTH-MONGO");

config.twitter = config.twitter || { };

function logout(request) {
  if(!request || !request.session) {
    return;
  }

  if(request.session.signin) {
    delete request.session.signin;
  }

  if(request.session.auth && request.session.auth.user) {
    request.session.auth = request.session.auth.user = undefined;
  }
}

function getCurrentCredentials(req, callback) {
  callback(null, req.session.signin);
}

function setCurrentCredentials(req, creds) {
  delete req.session.auth;
  req.session.signin = creds;
}

function manageCredentials(req, res, creds, userProvider) {
  logger.debug("ENTERING: AuthProvider.manageCredentials");
  setCurrentCredentials(req, creds);
  userProvider.getUserByCredentials(req, creds, function(error, result) {
    if(error) {
      logger.error(error.message);
      res.redirect("/error");
    }
    else if(!result) {
      logger.trace("No user found with credentials from: " + creds.service);
      if(req.session.user) {
        logger.trace("Merge creds with user in session.");
        req.session.user.creds.push(creds);
        userProvider.save(result, function(error, savedUser) {
          if(error) {
            logger.error(error.message);
            res.redirect("/error");
          }
          else {
            logger.trace("Head home...");
            res.redirect("home");
          }
        });
      }
      else {
        logger.trace("No user in session, no user with credentials from " + creds.service);
        res.redirect("/user/new");
      }
    }
    else {
      logger.trace("User found with those credentials from " + creds.service);
      var exist = false;
      for(var i = 0; i < result.creds.length; i++) {
        var r = result.creds[i];
        if(r.userId == creds.userId) {
          logger.trace("Refreshing credentials.");
          exist = true;
          result.creds[i] = creds;
        }
      }
      if(!exist) {
        logger.warn("A user was found with credentials, but they were not found in the array; this was not expected. Saving.");
        result.creds.push(creds);
      }
      userProvider.save(result, function(error, savedUser) {
        if(error) {
          logger.error(error.message);
          res.redirect("/error");
        }
        else {
          res.redirect("home");
        }
      });
    }
  });
  logger.debug("EXITING: AuthProvider.manageCredentials");
}

function setupRoutes(app, userProvider) {
  app.get('/auth/twitter', function(req, res, params) {
    req.authenticate(['twitter'], function(error, authenticated) {
      if (authenticated) {
        var creds = {
          service : "twitter",
          userId : req.session.auth.user.user_id,
          name : req.session.auth.user.username,
          oauth : {
            token : req.session.auth.twitter_oauth_token,
            secret : req.session.auth.twitter_oauth_token_secret
          }
        };
        manageCredentials(req, res, creds, userProvider);
      }
      else {
        res.redirect('/auth/error?s=tw');
      }
    });
  });

  app.get('/auth/github', function(req, res, params) {
    req.authenticate(['github'], function(error, authenticated) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      if( authenticated ) {
        var creds = {
          service : "github",
          userId : req.session.auth.user.id,
          name : req.session.auth.user.login,
          oauth : {
            token : req.session.access_token,
            secret : null
          }
        };
        manageCredentials(req, res, creds, userProvider);
        //res.end("<html><p>Hello github user:" + JSON.stringify( req.getAuthDetails().user ) + ".</p><p>" + sys.inspect(req.session) + "</p></html>")
      }
      else {
        res.end("<html><p>Github authentication failed :( </p></html>")
      }
    });
  });

  app.get ('/auth/foursquare', function(req, res, params) {
    req.authenticate(['foursquare'], function(error, authenticated) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      if( authenticated ) {
        var creds = {
          service : "foursquare",
          userId : req.session.auth.user.id,
          name : req.session.auth.user.firstname + " " + req.session.auth.user.lastname,
          oauth : {
            token : req.session.auth.foursquare_oauth_token,
            secret : req.session.auth.foursquare_oauth_token_secret
          }
        };
        manageCredentials(req, res, creds, userProvider);
        //res.end("<html><p>Hello foursquare user:" + JSON.stringify( req.session ) + ".</p></html>")
      }
      else {
        res.end("<html><h1>Foursquare authentication failed :( </h1></html>")
      }
    });
  });

  app.get ('/auth/facebook', function(req, res, params) {
    req.authenticate(['facebook'], function(error, authenticated) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      if( authenticated ) {
        res.end("<html><p>Hello Facebook user:" + JSON.stringify(  req.session) + ".</p></html>")
      }
      else {
        res.end("<html><h1>Facebook authentication failed :( </h1></html>")
      }
    });
  });
}

var auths = auth([
  auth.Twitter({consumerKey: config.twitter.key, consumerSecret: config.twitter.secret}),
  auth.Github({appId : config.github.appId, appSecret: config.github.appSecret, callback: config.github.callback}),
  auth.Foursquare({consumerKey: config.foursquare.key, consumerSecret: config.foursquare.secret})
]);

var AuthProvider = {
  "auths" : auths,
  "addRoutes" : setupRoutes,
  "logout" : logout,
  "getCurrentCredentials" : getCurrentCredentials
};

exports.AuthProvider = AuthProvider;