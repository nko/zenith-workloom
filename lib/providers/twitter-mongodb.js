var sys = require("sys"),
  Db = require('mongodb/db').Db,
  OAuth = require('oauth').OAuth,
  Server = require('mongodb/connection').Server,
  config = require('config-dev').config,
  log4js = require('log4js'),
  dt = require('datatypes').datatypes;

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
    for(var i = 0; i < user.creds.length; i++) {
      if(user.creds[i].service == "twitter") {
        cred = user.creds[i];
        break;
      }
    }
    return cred;
  }

  function getRetweetsBy(cred, callback) {
    oa.getProtectedResource("http://api.twitter.com/1/statuses/retweeted_by_me.json?count=100&trim_user=true", "GET", cred.oauth.token, cred.oauth.secret, function (error, data, response) {
      if (error) {
        callback(error);
      }
      else {
        callback(null, data);
      }
    });
  }

  function getRetweetsOf(cred, callback) {
    oa.getProtectedResource("http://api.twitter.com/1/statuses/retweets_of_me.json?count=100", "GET", cred.oauth.token, cred.oauth.secret, function (error, data, response) {
      if (error) {
        callback(error);
      }
      else {
        callback(null, data);
      }
    });
  }

  function getTimeline(cred, callback) {
    oa.getProtectedResource("http://api.twitter.com/1/statuses/user_timeline.json?count=200&trim_user=true", "GET", cred.oauth.token, cred.oauth.secret, function (error, data, response) {
      if (error) {
        callback(error);
      }
      else {
        callback(null, data);
      }
    });
  }

  function getTweets(cred, boundary, callback) {
    getTimeline(cred, function(error, data) {
      if(error) {
        callback(error);
      }
      else {
        var tweets = JSON.parse(data), valid = [];
        for(var i = 0; i < tweets.length; i++) {
          var tweet = tweets[i], date = Date.parse(tweet.created_at);
          if(date >= boundary) {
            valid.push(new dt.action("twitter", "tweet", tweet.created_at, tweet.text, "http://www.twitter.com/" + cred.name + "/status/" + tweet.id));
          }
          else {
            break;
          }
        }
        logger.debug("Total Tweets: " + tweets.length + "; total within boundary: " + valid.length);
        getRetweetsBy(cred, function(error, data) {
          if(error) {
            callback(error);
          }
          else {
            var tweets = JSON.parse(data);
            for(var i = 0; i < tweets.length; i++) {
              var tweet = tweets[i], date = Date.parse(tweet.created_at);
              if(date >= boundary) {
                valid.push(new dt.action("twitter", "retweet", tweet.created_at, tweet.text, "http://www.twitter.com/" + cred.name + "/status/" + tweet.id));
              }
              else {
                break;
              }
            }
            logger.debug("Total Tweets: " + tweets.length + "; total within boundary: " + valid.length);
            valid.sort(function(a, b) {
              return b.date - a.date;
            });
            callback(null, valid);
          }
        });
      }
    });
  }

  function getTodayTweets(cred, callback) {
    var today = new Date(),
      boundary = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    logger.debug("Boundary Date: " + boundary);
    boundary = Date.parse(boundary);
    getTweets(cred, boundary, callback);
  }

  function getWeekTweets(cred, callback) {
    var today = new Date(),
      boundary = new Date(today.getUTCFullYear(), today.getUTCMonth(), (today.getUTCDate() - 7));
    logger.debug("Boundary Date: " + boundary);
    boundary = Date.parse(boundary);
    getTweets(cred, boundary, callback);
  }

  return {
    "getTodayTweets" : getTodayTweets,
    "getWeekTweets" : getWeekTweets,
    "getTwitterCreds" : getTwitterCreds
  }
};

exports.TwitterProvider = TwitterProvider;