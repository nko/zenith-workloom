var sys = require('sys'),
    config = require('config-dev').config,
    log4js = require('log4js');

log4js.configure("./config/log4js-config.js");
var logger = log4js.getLogger("ROUTES-GITHUB");

function processError(res, error) {
  logger.error(error.message);
  res.redirect("/error");
}

GithubRoutes = {
  addRoutes : function(app, authProvider, userProvider, githubProvider) {
    app.get('/github/followers', function(req, res) {
      var user = userProvider.getCurrentUser(req), cred;
      if(!user) {
        res.redirect("/auth");
      }
      else {

        githubProvider.getUserFollowers(user, function(error, result) {
          if(error) {
            logger.error(error);
            res.redirect("/auth?mc=github");
          }
          else {
            if(!user.github) {
              user.github = {};
            }
            user.github.followers = result;
            userProvider.save(user, function(error, result) {
              if(error) {
                logger.error(error.message);
                res.redirect("/error");
              }
              else {
                res.send(result);
              }
            });
          }
        })
      }
    });
    
    app.get('/github/commits', function(req, res) {
      var user = userProvider.getCurrentUser(req), cred;
      if(!user) {
        res.redirect("/auth");
      }
      else {

        githubProvider.getUserRepoitoriesCommits(user, function(error, result) {
          if(error) {
            logger.error(error);
            res.redirect("/auth?mc=github");
          }
          else {
            if(!user.github) {
              user.github = {};
            }
            user.github.commits = result;
            userProvider.save(user, function(error, result) {
              if(error) {
                logger.error(error.message);
                res.redirect("/error");
              }
              else {
                res.send(result);
              }
            });
          }
        })
      }
    });
    /*
    app.get('/github', function(req, res) {
      logger.debug("ENTERING: /github");
      authProvider.getCurrentCredentials(req, function(error, creds) {
        if (error) {
          processError(res, error);
        }
        else if (!creds) {
          logger.trace("No auth in session...");
          res.redirect("/auth?r=/user");
        }
        else {
          userProvider.getUserByCredentials(req, creds, function(error, user) {
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
          userProvider.getUserByCredentials(req, creds, function(error, result) {
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
    });*/
  }
};

exports.GithubRoutes = GithubRoutes;