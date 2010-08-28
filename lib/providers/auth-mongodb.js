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
  delete request.session.signin;
  request.session.auth.user = undefined;
}

function getCurrentCredentials(req, callback) {
  callback(null, req.session.signin);
}

function setCurrentCredentials(req, creds) {
  req.session.signin = creds;
}

function setupRoutes(app, userProvider) {
  app.get('/auth/twitter', function(req, res, params) {
    req.authenticate(['twitter'], function(error, authenticated) {
      if (authenticated) {
        /*var oa = new OAuth(config.twitter.requestUrl,
          config.twitter.responseUrl,
          config.twitter.key,
          config.twitter.secret,
          "1.0",
          null,
          "HMAC-SHA1");*/

        var creds = {
          service : "twitter",
          userId : req.session.auth.user.user_id,
          name : req.session.auth.user.username,
          oauth : {
            token : req.session.auth.twitter_oauth_token,
            secret : req.session.auth.twitter_oauth_token_secret
          }
        };

        setCurrentCredentials(req, creds);
        userProvider.getCurrentUser(req, creds, function(error, result) {
          if(error) {
            logger.error(error.message);
            res.redirect("/error");
          }
          else if(!result) {
            res.redirect("/user/new");
          }
          else {
            res.redirect("home");
          }
        })
      }
      else {
        res.redirect('/auth/error?s=tw');
      }
    });
  });

  app.get ('/auth/github', function(req, res, params) {
    req.authenticate(['github'], function(error, authenticated) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      if( authenticated ) {
        res.end("<html><p>Hello github user:" + JSON.stringify( req.getAuthDetails().user ) + ".</p></html>")
      }
      else {
        res.end("<html><p>Github authentication failed :( </p></html>")
      }
    });
  })
}

var auths = auth([
  auth.Twitter({consumerKey: config.twitter.key, consumerSecret: config.twitter.secret}),
  auth.Github({appId : "f9736b2607d308158f36", appSecret: "d01c37eba5d3d53894c9fc88c89813a8cd1eb725", callback: "http://node-local.com:3000/auth/github_callback"})
]);

var AuthProvider = {
  "auths" : auths,
  "addRoutes" : setupRoutes,
  "logout" : logout,
  "getCurrentCredentials" : getCurrentCredentials
};

exports.AuthProvider = AuthProvider;