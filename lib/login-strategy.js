var connect = require('connect'),
  url = require('url'),
  userProvider = new UserProvider();

module.exports = function(options) {
  options = options || {};
  var that = {};
  var my = {};
  that.name = options.name || "login";

  function failed_validation(request, response, uri) {
    var parsedUrl = url.parse(request.url, true);
    var redirectUrl = "/auth/login";

    if (uri) {
      redirectUrl = redirectUrl + "?redirect_url =" + uri;
    }
    else if (parsedUrl.query && parsedUrl.query.redirect_url) {
      redirectUrl = redirectUrl + "?redirect_url =" + parsedUrl.query.redirect_url;
    }

    response.writeHead(303, { 'Location':  redirectUrl });
    response.end('');
  }

  function validate_credentials(executionScope, request, response, callback) {

    if (request.body && request.body.username && request.body.password) {
      var u = request.body.username;

      userProvider.getUserByUsername(u, function(error, result) {
        if (error) {
          callback(error);
        }
        else if (!result) {
          executionScope.fail(callback);
        }
        else if (result.password != request.body.password) {
          executionScope.fail(callback);
        }
        else {
          executionScope.success({ user : result }, callback)
        }
      });

      /*if(request.body.user == 'foo' && request.body.password == 'bar') {
       executionScope.success( { name : request.body.user }, callback)
       }
       else {
       executionScope.fail(callback)
       }*/
    }
    else {
      failed_validation(request, response);
    }
  }

  that.authenticate = function(request, response, callback) {
    if (request.body && request.body.user && request.body.password) {
      validate_credentials(this, request, response, callback);
    }
    else {
      failed_validation(request, response, request.url);
    }
  };

  that.setupRoutes = function(server) {
    server.use('/', connect.router(function routes(app) {

      app.post('/auth/login', function(request, response) {
        request.authenticate([that.name], function(error, authenticated) {
          var redirectUrl = "/user";
          var parsedUrl = url.parse(request.url, true);

          if (parsedUrl.query && parsedUrl.query.redirect_url) {
            redirectUrl = parsedUrl.query.redirect_url;
          }

          response.redirect(redirectUrl);
        })
      });

      app.get('/auth/login', function(request, response) {
        var parsedUrl = url.parse(request.url, true);
        var redirectUrl = "";

        if (parsedUrl.query && parsedUrl.query.redirect_url) {
          redirectUrl = "?redirect_url =" + parsedUrl.query.redirect_url;
        }

        response.render("login", {

        });
        response.end("<html><body><form action ='/auth/form_callback" + redirectUrl + "' method ='post'> \n\
                 <label for ='user'>Name</label><input type ='text' name ='user' id ='user'/><br/> \n\
                 <label for ='password'>Password</label><input type ='password' name ='password' id ='password'/> \n\
                 <input type ='submit'/> \n\
                 </form></body</html>");
      });
    }));
  };
  return that;
};