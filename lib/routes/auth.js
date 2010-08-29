var sys = require('sys'),
  AuthRoutes = {
    addRoutes : function(app, authProvider, userProvider) {
      app.get('/auth', function(req, res) {
        if (req.session.signin) {
          res.redirect('home');
        }
        else {
          res.render("auth.ejs", {
            layout : false,
            user : userProvider.getCurrentUser(req)
          });
        }
      });

      app.get('/error', function(req, res) {
        res.send('non-coded error');
      });

      app.get('/error/:code', function(req, res) {
        res.send('error ' + params.code);
      });
    }
  };

exports.AuthRoutes = AuthRoutes;