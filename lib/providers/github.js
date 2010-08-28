var sys = require("sys");
var GitHubApi = require("../node-github/lib/github").GitHubApi;
var github = new GitHubApi(true);

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
    github.getRepoApi().show('nko','zenith-workloom', function(error, rr) {
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
