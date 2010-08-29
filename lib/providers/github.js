require.paths.unshift("../../config");
require.paths.unshift("../../lib");

var sys = require("sys"),
    GitHubApi = require("github/lib/github").GitHubApi,
    config = require("config-dev").config,
    github = new GitHubApi(true);

GitHub = function() {

  function executeGithub(user, funk) {
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
    executeGithub(user, function(cred) {
      github.getUserApi().getFollowers(cred.name, function(error, followers) {
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
    executeGithub(user, function(cred) {
      github.getRepoApi().show(cred.name, repositoryName, function(error, repository) {
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
    executeGithub(user, function(cred) {
      github.getRepoApi().getUserRepos(cred.name, function(error, repository) {
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
    executeGithub(user, function(cred) {
      github.getUserApi().getWatchedRepos(cred.name, function(error, repository) {
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
    executeGithub(user, function(cred) {
      getUserRepository(user, repositoryName, function(error, repository) {
        if(error) {
          callback(error);
        }
        else {
          github.getCommitApi().getBranchCommits(cred.name, repository.name, "master", function(error, commit) {
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

  function getUserRepoitoriesCommits(user, callback) {
    executeGithub(user, function(cred) {
      getUserRepositories(user, function(error, repositories) {
        if(error) {
          callback(error);
        }
        else {
          for (var i=0; i < repositories.length; i++){
            repository = repositories[i]
            github.getCommitApi().getBranchCommits(cred.name, repository.name, "master", function(error, commit) {
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
    })
  }
  
  function getNkoRepositories(callback) {
    github.getRepoApi().getUserRepos("nko", function(error, repository) {
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
          github.getCommitApi().getBranchCommits("nko", repository.name, "master", function(error, commit) {
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
    "getUserFollowers" : getUserFollowers,
    "getUserRepository" : getUserRepository,
    "getUserRepositories" : getUserRepositories,
    "getUserWatchedRepositories" : getUserWatchedRepositories,
    "getUserRepositoryCommits" : getUserRepositoryCommits,
    "getUserRepoitoriesCommits" : getUserRepoitoriesCommits,
    "getNkoRepositories" : getNkoRepositories,
    "getNkoRepoitoriesCommits" : getNkoRepoitoriesCommits
  }
};

exports.GitHub = GitHub;