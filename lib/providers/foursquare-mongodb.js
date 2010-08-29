var sys = require("sys"),
  Db = require('mongodb/db').Db,
  OAuth = require('oauth').OAuth,
  Server = require('mongodb/connection').Server,
  config = require('config-dev').config,
  log4js = require('log4js'),
  dt = require('datatypes').datatypes;

log4js.configure("./config/log4js-config.js");
var logger = log4js.getLogger("4SQ-MONGO");

var oa = new OAuth(
  config.twitter.requestUrl,
  config.twitter.responseUrl,
  config.foursquare.key,
  config.foursquare.secret,
  "1.0",
  null,
  "HMAC-SHA1");

FoursquareProvider = function() {
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

  function getCreds(user) {
    var cred = null;
    for(var i = 0; i < user.creds.length; i++) {
      if(user.creds[i].service == "foursquare") {
        cred = user.creds[i];
        break;
      }
    }
    return cred;
  }

  function getCheckins(cred, boundary, callback) {
    oa.getProtectedResource("http://api.foursquare.com/v1/history?l=250", "GET", cred.oauth.token, cred.oauth.secret, function (error, data, response) {
      if (error) {
        callback(error);
      }
      else {
        var checkins = JSON.parse(data), valid = [];
        callback(null, data);
      }
    });

  }

  function getTodayCheckins(cred, callback) {
    var today = new Date(),
      boundary = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    logger.debug("Boundary Date: " + boundary);
    boundary = Date.parse(boundary);
    getCheckins(cred, boundary, callback);
  }

  function getWeekCheckins(cred, callback) {
    var today = new Date(),
      boundary = new Date(today.getUTCFullYear(), today.getUTCMonth(), (today.getUTCDate() - 7));
    logger.debug("Boundary Date: " + boundary);
    boundary = Date.parse(boundary);
    getCheckins(cred, boundary, callback);
  }


  return {
    "getCreds" : getCreds,
    "getCheckins" : getCheckins
  }
};

exports.FoursquareProvider = FoursquareProvider;