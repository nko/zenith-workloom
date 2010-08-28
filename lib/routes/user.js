var sys = require('sys'),
  config = require('config-dev').config,
  log4js = require('log4js');

log4js.configure("./config/log4js-config.js");
var logger = log4js.getLogger("ROUTES-USER");

function processError(res, error) {
  logger.error(error.message);
  res.redirect("/error");
}

function renderProfile(userProvider, username, user, res) {
  logger.debug("ENTERING: renderProfile");
  userProvider.getUserByUsername(username, function(error, foundUser) {
    if (error) {
      processError(res, error);
    }
    else if (!foundUser) {
      logger.trace("No user found by username: " + username);
      res.render("no.user.ejs", {
        layout : false
      });
    }
    else {
      logger.trace("Profile found by username: " + username);
      res.render("user.ejs", {
        layout : false,
        locals : {
          username : username,
          user : user,
          profileUser : foundUser
        }
      });
    }
  });
  logger.debug("EXITING: renderProfile");
}

UserRoutes = {

  addRoutes : function(app, authProvider, userProvider) {

    app.get('/user/new', function(req, res) {
      logger.debug("ENTERING: /user/new");

      authProvider.getCurrentCredentials(req, function(error, creds) {
        if (error) {
          processError(error);
        }
        else if (!creds) {
          logger.trace("No auth in session...");
          res.redirect("/auth?r=/user/new");
        }
        else {
          userProvider.getCurrentUser(req, creds, function(error, result) {
            if (error) {
              processError(error);
            }
            else if (result) {
              logger.trace("User in session; redirect to edit.");
              res.redirect('/user/edit');
            }
            else {
              logger.trace("Need to create a new user.");
              res.render("new.ejs", {
                layout : false,
                locals : {
                  creds : creds,
                  username : null,
                  error : null
                }
              });
            }
          });
        }
      });
      logger.debug("EXITING: /user/new");
    });

    app.get('/user', function(req, res) {
      logger.debug("ENTERING: /user");

      authProvider.getCurrentCredentials(req, function(error, creds) {
        if (error) {
          processError(res, error);
        }
        else if (!creds) {
          logger.trace("No auth in session...");
          res.redirect("/auth?r=/user");
        }
        else {
          userProvider.getCurrentUser(req, creds, function(error, user) {
            if (error) {
              processError(res, error);
            }
            else if (user) {
              logger.trace("Current User: " + user.username);
              res.render("home.ejs", {
                layout : false,
                locals : {
                  user : user
                }
              });
            }
            else {
              logger.trace("No Current User; redirecting");
              res.redirect("/user/new");
            }
          });
        }
      });
      logger.debug("EXITING: /user");
    });

    app.get('/user/new/save', function(req, res) {
      req.redirect('/user');
    });

    app.post('/user/new/save', function(req, res) {
      logger.debug("ENTERING: /user/new/save");

      authProvider.getCurrentCredentials(req, function(error, creds) {
        if (error) {
          processError(error);
        }
        else if (!creds) {
          logger.trace("No auth in session...");
          res.redirect("/auth?r=/user/new");
        }
        else {
          userProvider.getCurrentUser(req, creds, function(error, result) {
            if (error) {
              processError(error);
            }
            else if (result) {
              logger.trace("User exists; redirect to edit.");
              res.redirect('/user/edit');
            }
            else {
              var username = req.param("username"),
                authClone = JSON.parse(JSON.stringify(creds)),
                user = {};
              user.username = username;
              user.creds = authClone;

              userProvider.create(user, function(error, result) {
                if (error) {
                  logger.trace("Error creating new user.");

                  if (error.code && error.code == 1002) {
                    logger.trace("User name already taken.");
                    res.render("new.ejs", {
                      layout : false,
                      locals : {
                        creds : creds,
                        username : username,
                        error : "That user name is already taken."
                      }
                    });
                  }
                  else {
                    processError(error);
                  }
                }
                else {
                  logger.trace("User created: " + result.username);
                  userProvider.setCurrentUser(req, result);
                  res.redirect("home");
                }
              });
            }
          });
        }
      });
      logger.debug("EXITING: /user/new/save");
    });

    app.get('user/edit', function(req, res) {
      logger.debug("ENTERING: /user/edit");

      authProvider.getCurrentCredentials(req, function(error, creds) {
        if (error) {
          processError(error);
        }
        else if (!creds) {
          logger.trace("No auth in session...");
          res.redirect("/auth?r=/user/edit");
        }
        else {
          userProvider.getCurrentUser(req, creds, function(error, result) {
            if (error) {
              processError(error);
            }
            else if (!result) {
              res.redirect("/user/new");
            }
            else {
              res.send("edit existing user");
            }
          });
        }
      });

      logger.debug("EXITING: /user/edit");
    });

    app.post('/user/edit/save', function(req, res, params) {
      logger.debug("ENTERING: /user/edit/save");

      authProvider.getCurrentCredentials(req, function(error, creds) {
        if (error) {
          processError(error);
        }
        else if (!creds) {
          logger.trace("No auth in session...");
          res.redirect("/auth?r=/user/edit");
        }
        else {
          userProvider.getCurrentUser(req, creds, function(error, user) {
            if (error) {
              processError(error);
            }
            else if (!user) {
              logger.trace("No current user...");
              res.redirect("/user/new");
            }
            else {
              var username = req.param("username");
              if (!username) {
                logger.trace("No username in request...");
                res.redirect("/user/edit");
              }
              else {
                logger.trace("Saving user...");
                user.username = username;
                user.creds = JSON.parse(JSON.stringify(creds));
                userProvider.save(user, function(error, result) {
                  if (error) {
                    processError(error);
                  }
                  else {
                    res.redirect('home');
                  }
                });
              }
            }
          });
        }
      });
    });

    app.get('/user/:username', function(req, res) {
      logger.debug("ENTERING: /user/[username]");
      var un = req.param("username");

      if (!un) {
        logger.trace("No username in request; cannot find user.");
        res.render("no.user.ejs", {
          layout : false
        });
      }
      else {
        logger.trace("Getting credentials...");
        authProvider.getCurrentCredentials(req, function(error, creds) {
          if (error) {
            processError(res, error);
          }
          else if (creds) {
            logger.trace("Getting current user...");
            userProvider.getCurrentUser(req, creds, function(error, user) {
              if (error) {
                processError(res, error);
              }
              else {
                logger.trace("Rendering user profile with user.");
                renderProfile(userProvider, un, user, res);
              }
            });
          }
          else {
            logger.trace("Rendering user profile without user.");
            renderProfile(userProvider, un, null, res);
          }
        });
      }

      logger.debug("EXITING: /user/[username]");
    });
  }
};

exports.UserRoutes = UserRoutes;