var sys = require('sys'),
    log4js = require('log4js');


var logger = log4js.getLogger("ROUTES-AUTH");

AuthRoutes = {
    addRoutes : function(app, authProvider) {
        app.get('/auth', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth");
            if(req.session.signin) {
                res.redirect('home');
            }
            else {
                res.send('display login or create');
            }
            logger.debug("EXITING: AuthRoutes.auth");
        });

        app.get('/auth/login', function(req, res) {
            res.redirect('/auth');
        });

        app.post('/auth/login', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth.login");
            res.send('process login creds and forward');
            logger.debug("EXITING: AuthRoutes.auth.login");
        });

        app.get('/auth/logout', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth.logout");
            res.send('logout and forward');
            logger.debug("ENTERING: AuthRoutes.auth.logout");
        });

        app.get('/auth/new', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth.new");
            res.render("auth-new", {
                
            });
            logger.debug("EXITING: AuthRoutes.auth.new");
        });

        app.get('/auth/new/create', function(req, res) {
            res.redirect('/auth/new');
        });

        app.post('/auth/new/create', function(req, res) {
            logger.debug("ENTERING: AuthRoutes.auth.new.create");
            res.send('create and process');
            logger.debug("EXITING: AuthRoutes.auth.new.create");
        });
    }
};

exports.AuthRoutes = AuthRoutes;