var sys = require("sys"),
    Db = require('mongodb/db').Db,
    Server = require('mongodb/connection').Server,
	config = require('../../config/config-dev').config,
    log4js = require('log4js');

log4js.configure("./config/log4js-config.js");
var logger = log4js.getLogger("AUTH-MONGO");

AuthProvider = function() {
    
    if(config && config.database) {
        if(!config.database.host || !config.database.port) {
            logger.error("Database host and/or port not specified; check the config directory.");
            throw new Error("Database host and/or port not specified.");
        }
    }
    else {
        logger.error("No database configuration found; check the config directory.");
        throw new Error("No database configuration.");
    }

	var db = new Db(config.database.name, new Server(config.database.host, config.database.port, { auto_reconnect: true }, {}));
  	db.open( function() {
          logger.debug("Database connection established.");
    });

    return {

    }
};

exports.AuthProvider = AuthProvider;