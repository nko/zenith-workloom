require.paths.unshift("../../config");
require.paths.unshift("../../lib");

var sys = require("sys"),
    GitHubApi = require("github/lib/github").GitHubApi,
    config = require("config-dev").config,
    githubapi = new GitHubApi(true),
    log4js = require('log4js'),
    dt = require('datatypes').datatypes,
    df = require('datatypes').datatypeFunctions;

log4js.configure("./config/log4js-config.js");
var logger = log4js.getLogger("GITHUB-MONGO");

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
      if(user.creds[i].service == "github") {
        cred = user.creds[i];
        break;
      }
    }
    return cred;
  }


  function getNkoRepositoriesCommits(cred, callback) {
    getNkoRepositories(function(error, repositories) {
      if(error) {
        callback(error);
      }
      else {
        for (var i=0; i < repositories.length; i++){
          repository = repositories[i];
          var results = [];
          githubapi.getCommitApi().getBranchCommits("nko", repository.name, "master", function(error, commit) {
            if(error) {
              callback(error);
            }
            else {
              for(var i = 0; i < commit.length; i++) {
                var c = commit[i];

                var date = c.committed_date, split = date.split("T"),
                  ymd = split[0].split("-"), t = split[1].split("-"), hms = t[0].split(":");

                date = new Date(ymd[0], ymd[1], ymd[2], hms[0], hms[1], hms[2]);

                if(c.committer.login == cred.name) {
                  results.push(dt.action("github", "commit", date, c.message, c.url));
                }
              }
              //logger.debug(sys.inspect(results));
              callback(null, results);
            }
          });
        }
      }
    });
  }

  function getUserRepositoriesCommits(cred, user, callback) {
    if(!cred) {
      logger.error("No credentials.");
      callback(null, null);
    }
    else {
      getUserRepositories(user, function(error, repositories) {
        if(error) {
          logger.error(error.message);
          callback(error);
        }
        else {
          for (var i=0; i < repositories.length; i++){
            repository = repositories[i];
            logger.debug("Repository: " + sys.inspect(repository));
            githubapi.getCommitApi().getBranchCommits(cred.name, repository.name, "master", function(error, commit) {
              if(error) {
                logger.error(sys.inspect(repository.name));
                callback(error);
              }
              else {
                logger.debug("Commits: " + sys.inspect(commit));
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

  return {
    "getCreds" : getCreds,
    "getUserFollowers" : getUserFollowers,
    "getUserRepository" : getUserRepository,
    "getUserRepositories" : getUserRepositories,
    "getUserWatchedRepositories" : getUserWatchedRepositories,
    "getUserRepositoryCommits" : getUserRepositoryCommits,
    "getUserRepositoriesCommits" : getUserRepositoriesCommits,
    "getNkoRepositories" : getNkoRepositories,
    "getNkoRepositoriesCommits" : getNkoRepositoriesCommits
  }
};

exports.GithubProvider = GithubProvider;