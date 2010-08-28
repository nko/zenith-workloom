
var sys = require('sys'),
	AuthRoutes = {
		addRoutes : function(app, authProvider) {
			app.get('/auth', function(req, res) {
				if(req.session.signin) {
					res.redirect('home');
				}
				else {
					res.send("Prompt to login with <a href='/auth/twitter'>Twitter</a>.");
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