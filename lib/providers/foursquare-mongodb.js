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
    if(!cred) {
      logger.error("No credentials.");
      callback(null, null);
    }
    else {
      oa.getProtectedResource("http://api.foursquare.com/v1/history.json?l=100", "GET", cred.oauth.token, cred.oauth.secret, function (error, data, response) {
        if (error) {
          logger.error("Error in OA.");
          callback(error);
        }
        else {
          var checkins = JSON.parse(data).checkins, valid = [], start = new Date(checkins[0].created).getDay(), track = 0;
          for(var i = 0; i < checkins.length && track < boundary; i++) {
            var checkin = checkins[i], day = new Date(checkin.created).getDay();
            if(day == start) {
              valid.push(new dt.action("foursquare", "checkin", checkin.created, checkin.venue.name + " (" + checkin.venue.address + " " + checkin.venue.city + ", " + checkin.venue.state + ")", ""));
            }
            else {
              track++;
              if(track < boundary) {
                start = day;
                valid.push(new dt.action("foursquare", "checkin", checkin.created, checkin.venue.name + " (" + checkin.venue.address + " " + checkin.venue.city + ", " + checkin.venue.state + ")", ""));
              }
              else {
                break;
              }
            }
          }
          logger.debug("Total Checkins: " + checkins.length + "; total within boundary: " + valid.length);
          callback(null, valid);
        }
      });
    }
  }

  function getTodayCheckins(cred, callback) {
    getCheckins(cred, 1, callback);
  }

  function getWeekCheckins(cred, callback) {
    getCheckins(cred, 6, callback);
  }


  return {
    "getCreds" : getCreds,
    "getTodayCheckins" : getTodayCheckins,
    "getWeekCheckins" : getWeekCheckins
  }
};

exports.FoursquareProvider = FoursquareProvider;