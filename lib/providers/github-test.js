GitHub = require('./github').GitHub;
require('./user-mongodb');

var sys = require("sys");

var gufs = new GitHub().getUserFollowers(userProvider, function(error, result) {
  if(error) {
    sys.log("gufs ERROR: " + sys.inspect(error));
  }
  else {
    sys.log("RESULT: " + sys.inspect(result));
  }
});

var gur = new GitHub().getUserRepository("advisorshq", function(error, result) {
  if(error) {
    sys.log("gur ERROR: " + sys.inspect(error));
  }
  else {
    //sys.log("RESULT: " + sys.inspect(result));
  }
});

var gurs = new GitHub().getUserRepositories(function(error, result) {
  if(error) {
    sys.log("gurs ERROR: " + sys.inspect(error));
  }
  else {
    //sys.log("RESULT: " + sys.inspect(result));
  }
});

var guwrs = new GitHub().getUserWatchedRepositories(function(error, result) {
  if(error) {
    sys.log("guwrs ERROR: " + sys.inspect(error));
  }
  else {
    //sys.log("RESULT: " + sys.inspect(result));
  }
});

var gurcs = new GitHub().getUserRepositoryCommits("advisorshq",function(error, result) {
  if(error) {
    sys.log("gurcs ERROR: " + sys.inspect(error));
  }
  else {
    //sys.log("RESULT: " + sys.inspect(result));
  }
});

var gurscs = new GitHub().getUserRepoitoriesCommits(function(error, result) {
  if(error) {
    sys.log("gurscs ERROR: " + sys.inspect(error));
  }
  else {
    //sys.log("RESULT: " + sys.inspect(result));
  }
});

var gnrs = new GitHub().getNkoRepositories(function(error, result) {
  if(error) {
    sys.log("gnrs ERROR: " + sys.inspect(error));
  }
  else {
    //sys.log("RESULT: " + sys.inspect(result));
  }
});

var gnrscs = new GitHub().getNkoRepoitoriesCommits(function(error, result) {
  if(error) {
    sys.log("gnrscs ERROR: " + sys.inspect(error));
  }
  else {
    //sys.log("RESULT: " + sys.inspect(result));
  }
});