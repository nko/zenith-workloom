var sys = require("sys");
var GitHubApi = require("../github/lib/github").GitHubApi;
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
    github.authenticate('kylejginavan','Ironman7171')
    
    sys.log(sys.inspect(github.getRepoApi()))
    //github.getRepoApi().show('kylejginavan','youtube_it', function(error, rr) {
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
var test = new GitHub().getRepo(function(error, result) {
  sys.log(sys.inspect(error));
  sys.log(sys.inspect(result));
});
