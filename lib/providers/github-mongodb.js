require.paths.unshift("../../config");
require.paths.unshift("../../lib");

var sys = require("sys"),
    GitHubApi = require("github/lib/github").GitHubApi,
    config = require("config-dev").config,
    githubapi = new GitHubApi(true);

GithubProvider = function() {

  function execute(user, funk) {
    var cred = null;

    for(var i = 0; user.creds.length; i++) {
      if(user.creds[i].service == "github") {
        cred = user.creds[i];
        break;
      }
    }

    if(!cred) {
      callback(new Error("User logged in doesn't have github credentials."));
    }
    else {
      funk(cred);
    }
  }

  function getUserFollowers(user, callback) {
    execute(user, function(cred) {
      githubapi.getUserApi().getFollowers(cred.name, function(error, followers) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, followers);
        }
      });
    })
  }
  
  function getUserRepository(user, repositoryName, callback) {
    execute(user, function(cred) {
      githubapi.getRepoApi().show(cred.name, repositoryName, function(error, repository) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, repository);
        }
      });
    })
  }

  function getUserRepositories(user, callback) {
    execute(user, function(cred) {
      githubapi.getRepoApi().getUserRepos(cred.name, function(error, repository) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, repository);
        }
      });
    })
  }
  
  function getUserWatchedRepositories(user, callback) {
    execute(user, function(cred) {
      githubapi.getUserApi().getWatchedRepos(cred.name, function(error, repository) {
        if(error) {
          callback(error);
        }
        else {
          callback(null, repository);
        }
      });
    })
  }

  function getUserRepositoryCommits(user, repositoryName, callback) {
    execute(user, function(cred) {
      getUserRepository(user, repositoryName, function(error, repository) {
        if(error) {
          callback(error);
        }
        else {
          githubapi.getCommitApi().getBranchCommits(cred.name, repository.name, "master", function(error, commit) {
            if(error) {
              callback(error);
            }
            else {
              callback(null, commit);
            }
          });
        }
      });
    })
  }

  function getCreds(user) {
    var cred = null;
    for(var i = 0; i < user.creds.length; i++) {
      if(user.creds[i].service == "foursquare") {
        cred = user.creds[i];
        break;
      }
    }
    return cred;
  }

  function getUserRepositoriesCommits(cred, user, callback) {
    if(!cred) {
      callback(null, null);
    }
    else {
      getUserRepositories(user, function(error, repositories) {
        if(error) {
          callback(error);
        }
        else {
          for (var i=0; i < repositories.length; i++){
            repository = repositories[i];
            githubapi.getCommitApi().getBranchCommits(cred.name, repository.name, "master", function(error, commit) {
              if(error) {
                sys.log(sys.inspect(repository.name));
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
  }
  
  function getNkoRepositories(callback) {
    githubapi.getRepoApi().getUserRepos("nko", function(error, repository) {
      if(error) {
        callback(error);
      }
      else {
        callback(null, repository);
      }
    });
  }
  
  function getNkoRepoitoriesCommits(callback) {
    getNkoRepositories(function(error, repositories) {
      if(error) {
        callback(error);
      }
      else {
        for (var i=0; i < repositories.length; i++){
          repository = repositories[i]
          githubapi.getCommitApi().getBranchCommits("nko", repository.name, "master", function(error, commit) {
            if(error) {
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
    "getCreds" : getCreds,
    "getUserFollowers" : getUserFollowers,
    "getUserRepository" : getUserRepository,
    "getUserRepositories" : getUserRepositories,
    "getUserWatchedRepositories" : getUserWatchedRepositories,
    "getUserRepositoryCommits" : getUserRepositoryCommits,
    "getUserRepositoriesCommits" : getUserRepositoriesCommits,
    "getNkoRepositories" : getNkoRepositories,
    "getNkoRepoitoriesCommits" : getNkoRepoitoriesCommits
  }
};

exports.GithubProvider = GithubProvider;