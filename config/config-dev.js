
var config = {
    database : {
        host : process.env['NODE_MONGO_DRIVER_HOST'],
        port : process.env['NODE_MONGO_DRIVER_PORT'],
        name : process.env['NODE_MONGO_DATABASE_NAME']
    },
  facebook : {
    id : process.env['NODE_FACEBOOK_ID'],
    secret : process.env['NODE_FACEBOOK_SECRET'],
    callbackUrl : process.env['NODE_FACEBOOK_CALLBACK']
  },
  twitter : {
    key : process.env['NODE_TWITTER_KEY'],
    secret : process.env['NODE_TWITTER_SECRET'],
    requestUrl : "https://api.twitter.com/oauth/request_token",
    responseUrl : "https://api.twitter.com/oauth/access_token"
  },
  github : {
    key : process.env['NODE_GITHUB_KEY'],
    token : process.env['NODE_GITHUB_TOKEN']
  },
    port : process.env['NODE_HTTP_PORT'] ? process.env['NODE_HTTP_PORT'] : 3000
};

exports.config = config;