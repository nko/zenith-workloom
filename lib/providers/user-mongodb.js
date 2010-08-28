var sys = require("sys"),
    Db = require('mongodb/db').Db,
    Server = require('mongodb/connection').Server,
	config = require('../../config/config-dev').config,
    log4js = require('log4js');

log4js.configure("./config/log4js-config.js");
var logger = log4js.getLogger("USER-MONGO");

UserProvider = function() {
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

    /**
     * Merge two objects.
     * @param o1 Object 1.
     * @param o2 Object 2.
     * @param override Boolean to determine if attributes in o1 will be overwritten with matching attributes from o2.
     */
	function merge(o1, o2, override) {
		for(var a in o2) {
			if(override) {
				o1[a] = o2[a];
				continue
			}
			if(!o1[a]) {
				o1[a] = o2[a];
			}
		}
	}

    /**
     * Get User Collection
     * @param callback
     */
	function getUsers(callback) {
        logger.debug("ENTERING: **UserProvider.getUsers");
		db.collection('users', function(error, userCollection) {
			if(error) {
				callback(error);
			}
			else {
				callback(null, userCollection);
			}
		});
        logger.debug("EXITING: **UserProvider.getUsers");
	}

    /**
     * Retrieve a user by username.
     * @param username
     * @param callback
     */
    function getUserByUsername(username, callback) {
        logger.debug("ENTERING: UserProvider.findByUsername");
		getUsers(function(error, userCollection) {
			if(error) {
				callback(error);
			}
			else {
				userCollection.findOne({ "username": username }, function(error, result) {
					if(error) {
						callback(error);
					}
					else {
						callback(null, result);
					}
				});
			}
		});
		logger.debug("EXITING: UserProvider.findByUsername");
    }

    /**
     * Create a new user.
     * <strong>NOTE</strong>: Data structure validation does not occur here.
     *
     * @param user
     * @param callback
     * @throws Error (1002) if the user already exists by user name.
     */
    function create(user, callback) {
		logger.debug("ENTERING: UserProvider.create");
		findByUsername(user.username, function(error, foundUser) {
			if(error) {
				callback(error);
			}
			else {
				if(foundUser) {
					logger.warn("User found with username: " + user.username + ". Cannot create.");
					var err = new Error("User Exists");
					err.code = 1002;
					callback(err);
				}
				else {
					logger.info("Saving new user: " + user.username);
					save(user, function(error, newUser) {
						if(error) {
							callback(error);
						}
						else {
							callback(null, newUser);
						}
					});
				}
			}
		});
		logger.debug("EXITING: UserProvider.create");
	}

    /**
     * Saves a user to the database.
     * <strong>NOTE</strong>: Data structure validation does not occur here, nor does checking for existence.
     *
     * @param user
     * @param callback
     */
	function save(user, callback) {
		logger.debug("ENTERING: UserProvider.save");
		getUsers(function(error, userCollection) {
			if(error) {
				callback(error);
			}
			else {
				findByUsername(user.username, function(error, foundUser) {
					if(error) {
						callback(error);
					}
					else {
						if(foundUser) {
                            logger.info("User " + user.username + " found; mergine and saving.");
                            logger.trace("Merge:\n\t" + sys.inspect(foundUser) + "\nwith\n\t" + sys.inspect(user));
							merge(foundUser, user, true);
							logger.debug("Result: " + sys.inspect(foundUser));
							foundUser._lastUpdated = new Date();
							userCollection.update(foundUser);
							callback(null, foundUser);
						}
						else {
							logger.info("User " + user.username + "not found; saving new user.");
							user._created = new Date();
							user._lastUpdated = new Date();
							userCollection.insert(user, function() {
								logger.debug("Created new user: " + sys.inspect(user));
								callback(null, user);
							});
						}
					}
				});
			}
		});
		logger.debug("EXITING: UserProvider.save");
	}

    return {
        getUserByUsername : getUserByUsername,
        create : create,
        save : save
    };
};

exports.UserProvider = UserProvider;