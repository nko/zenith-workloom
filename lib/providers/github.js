require.paths.unshift("../../config");
require.paths.unshift("../../lib");
var sys = require("sys"),
    GitHubApi = require("github/lib/github").GitHubApi,
    config = require("config-dev").config,
    github = new GitHubApi(true);

GitHub = function() {

  function getUserFollowers(callback) {
    github.getUserApi().getFollowers(config.github.login, function(error, followers) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, followers);
      }
    });
  }
  
  function getUserRepository(repositoryName, callback) {
    github.authenticate(config.github.login, config.github.token);
    github.getRepoApi().show(config.github.login, repositoryName, function(error, repository) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, repository);
      }
    });
  }

  function getUserRepositories(callback) {
    github.authenticate(config.github.login, config.github.token).getRepoApi().getUserRepos(config.github.login, function(error, repository) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, repository);
      }
    });
  }
  
  function getUserWatchedRepositories(callback) {
    github.authenticate(config.github.login, config.github.token).getUserApi().getWatchedRepos(config.github.login, function(error, repository) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, repository);
      }
    });
  }

  function getUserRepositoryCommits(repositoryName, callback) {
    getUserRepository(repositoryName, function(error, repository) {
      if(error) {
        callback(error);
      }
      else {
        github.getCommitApi().getBranchCommits(config.github.login, repository.name, "master", function(error, commit) {
          if(error) {
            callback(error);
          }
          else {
            callback(null, commit);
          }
        });
      }
    });
  }

  function getUserRepoitoriesCommits(callback) {
    getUserRepositories(function(error, repositories) {
      if(error) {
        callback(error);
      }
      else {
        for (var i=0; i < repositories.length; i++){
          repository = repositories[i]
          github.getCommitApi().getBranchCommits(config.github.login, repository.name, "master", function(error, commit) {
            if(error) {
              sys.log(sys.inspect(repository.name))
              callback(error);
            }
            else {
              callback(null, commit);
            }
          });
        }
      }
    });
  }

  return {
    "getUserFollowers" : getUserFollowers,
    "getUserRepository" : getUserRepository,
    "getUserRepositories" : getUserRepositories,
    "getUserWatchedRepositories" : getUserWatchedRepositories,
    "getUserRepositoryCommits" : getUserRepositoryCommits,
    "getUserRepoitoriesCommits" : getUserRepoitoriesCommits
  }
};

exports.GitHub = GitHub;