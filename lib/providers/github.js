require.paths.unshift("../../config");
require.paths.unshift("../../lib");
var sys = require("sys"),
    GitHubApi = require("github/lib/github").GitHubApi,
    config = require("config-dev").config,
    github = new GitHubApi(true);

GitHub = function() {

  function getFollowers(callback) {
    github.getUserApi().getFollowers(config.github.login, function(error, followers) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, followers);
      }
    });
  }
  
  function getRepo(callback) {
    github.authenticate(config.github.login, config.github.token);
    github.getRepoApi().show(config.github.login, "stringshub", function(error, repository) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, repository);
      }
    });
  }

  function getRepos(callback) {
    github.authenticate(config.github.login, config.github.token);
    github.getRepoApi().getUserRepos(config.github.login, function(error, repository) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, repository);
      }
    });
  }
  
  function getWatchedRepos(callback) {
    github.authenticate(config.github.login, config.github.token);
    github.getUserApi().getWatchedRepos(config.github.login, function(error, repository) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, repository);
      }
    });
  }

  return {
    "getFollowers" : getFollowers,
    "getRepo" : getRepo,
    "getRepos" : getRepos,
    "getWatchedRepos" : getWatchedRepos
  }
};

exports.GitHub = GitHub;

var gr = new GitHub().getRepo(function(error, result) {
  sys.log(sys.inspect(error));
  sys.log(sys.inspect(result));
});

// var test_two = new GitHub().getFollowers(function(error, result) {
//   sys.log(sys.inspect(error));
//   sys.log(sys.inspect(result));
// });
//sys.log(sys.inspect(github.authenticate(config.github.login, config.github.token)));