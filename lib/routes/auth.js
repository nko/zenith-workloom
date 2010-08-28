var sys = require('sys'),
    log4js = require('log4js'),
    userValidator = require("validators/user-validator").UserValidator,
    loginStrategy= require('login-strategy');


var logger = log4js.getLogger("ROUTES-AUTH");

AuthRoutes = {
    addRoutes : function(app, authProvider, userProvider) {
        app.get('/auth', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth");
            if(req.session.signin) {
                res.redirect('home');
            }
            else {
                res.redirect('/auth/login');
            }
            logger.debug("EXITING: AuthRoutes.auth");
        });

        /*app.get('/auth/login', function(req, res) {
            res.redirect('/auth');
        });

        app.post('/auth/login', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth.login");



            logger.debug("EXITING: AuthRoutes.auth.login");
        });*/

        app.get('/auth/logout', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth.logout");
            res.send('logout and forward');
            logger.debug("ENTERING: AuthRoutes.auth.logout");
        });

        app.get('/auth/new', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth.new");
            res.render("auth-new", {
                locals : {
                    "user" : {},
                    "errors" : []
                }
            });
            logger.debug("EXITING: AuthRoutes.auth.new");
        });

        app.get('/auth/new/create', function(req, res) {
            res.redirect('/auth/new');
        });

        app.post('/auth/new/create', function(req, res, params) {
            logger.debug("ENTERING: AuthRoutes.auth.new.create");
            var p = req.body, user = {
                "username" : p["username"],
                "fullname" : p["fullname"],
                "email" : p["email"],
                "zip" : p["zip"],
                "password" : p["password"],
                "verify" : p["verify"]
            }, errors = userValidator.check(user);

            if(errors.length > 0) {
                res.render("auth-new", {
                    locals : {
                        "user" : user,
                        "errors" : errors
                    }
                });
            }
            else {
                delete user.verify;
                userProvider.getUserByUsername(user.username, function(error, result) {
                    if(error) {
                        logger.error(sys.inspect(error));
                        res.redirect("/error");
                    }
                    else if(result) {
                        res.render("auth-new", {
                            locals : {
                                "user" : user,
                                "errors" : ["This user name is already taken."]
                            }
                        });
                    }
                    else {
                        userProvider.create(user, function(error, result) {
                            res.redirect("/user/edit");
                        });
                    }
                });
            }

            logger.debug("EXITING: AuthRoutes.auth.new.create");
        });
    }
};

exports.AuthRoutes = AuthRoutes;