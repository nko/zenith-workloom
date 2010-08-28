require.paths.unshift("../../config");
require.paths.unshift("../../lib");
var sys = require("sys"),
    GitHubApi = require("github/lib/github").GitHubApi,
    config = require("config-dev").config,
    github = new GitHubApi(true);

GitHub = function() {

  function getFollowers(callback) {
    github.getUserApi().getFollowers('kylejginavan', function(error, followers) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, followers);
      }
    });
  }
  
  function getRepo(callback) {
    sys.log(sys.inspect(github.authenticate(config.github.login,config.github.token)))
    
    //sys.log(sys.inspect(github.getRepoApi()))
    //github.getRepoApi().show('kylejginavan','youtube_it', function(error, rr) {
    github.getRepoApi().show('kylejginavan','zenith-workloom', function(error, rr) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, rr);
      }
    });
  }

  return {
    "getFollowers" : getFollowers,
    "getRepo" : getRepo
  }

};

exports.GitHub = GitHub;
var test = new GitHub().getRepo(function(error, result) {
  sys.log(sys.inspect(error));
  sys.log(sys.inspect(result));
});
