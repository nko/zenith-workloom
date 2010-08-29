var sys = require("sys"),
  Db = require('mongodb/db').Db,
  OAuth = require('oauth').OAuth,
  Server = require('mongodb/connection').Server,
  config = require('config-dev').config,
  log4js = require('log4js');

log4js.configure("./config/log4js-config.js");
var logger = log4js.getLogger("TWITTER-MONGO");

var oa = new OAuth(config.twitter.requestUrl,
  config.twitter.responseUrl,
  config.twitter.key,
  config.twitter.secret,
  "1.0",
  null,
  "HMAC-SHA1");

TwitterProvider = function() {
  if (config && config.database) {
    if (!config.database.host || !config.database.port) {
      logger.error("Database host and/or port not specified; check the config directory.");
      throw new Error("Database host and/or port not specified.");
    }
  }
  else {
    logger.error("No database configuration found; check the config directory.");
    throw new Error("No database configuration.");
  }

  var db = new Db(config.database.name, new Server(config.database.host, config.database.port, { auto_reconnect: true }, {}));
  db.open(function(err, db) {
    if(config.database.user && config.database.pass) {
      db.authenticate(config.database.user, config.database.pass, function(err, db) {
        if (err) {
          logger.error(err);
        }
        else {
          logger.debug("Database connection established.");
        }
      });
    }
  });

  function getTwitterCreds(user) {
    var cred = null;
    for(var i = 0; user.creds.length; i++) {
      if(user.creds[i].service == "twitter") {
        cred = user.creds[i];
        break;
      }
    }
    return cred;
  }

  function getTimeline(cred, callback) {
    oa.getProtectedResource("http://api.twitter.com/1/statuses/user_timeline.json", "GET", cred.oauth.token, cred.oauth.secret, function (error, data, response) {
      if (error) {
        callback(error);
      }
      else {
        callback(null, data);
      }
    });
  }

  function getTodayTweets(cred, callback) {
    var today = new Date().getUTCDate(),
      boundary = new Date(today.getUTCYear(), today.getUTCMonth(), today.getUTCDay());

    //getTimeline(cred, )
  }

  function test(userProvider, callback) {
    userProvider.getUserByUsername("clintandrewhall", function(error, result) {
      if (error) {
        callback(error);
      }
      else {
        var cred = getTwitterCreds(result);

        if(!cred) {
          callback(new Error("No Credentials"));
        }
        else {
          getTimeline(cred, callback);
        }
      }
    });
  }

  return {
    "test" : test
  }
};

exports.TwitterProvider = TwitterProvider;