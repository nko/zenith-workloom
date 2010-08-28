var sys = require('sys'),
    log4js = require('log4js');


var logger = log4js.getLogger("ROUTES-USER");

AuthRoutes = {
    addRoutes : function(app, authProvider, userProvider) {
        app.get('/user', function(req, res) {
            logger.debug("ENTERING: UserRoutes.user");
            res.send('user home');
            logger.debug("EXITING: UserRoutes.user");
        });

        app.get('/user/edit', function(req, res) {
            logger.debug("ENTERING: UserRoutes.user.edit");
            res.send('edit user/preferences');
            logger.debug("EXITING: UserRoutes.user.edit");
        });

        app.get('/user/:username', function(req, res) {
            logger.debug("ENTERING: UserRoutes.user:username");
            res.send('user display');
            logger.debug("EXITING: UserRoutes.user:username");
        });
    }
};

exports.AuthRoutes = AuthRoutes;