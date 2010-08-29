
datatypes = {
  "action" : function(source, type, date, description, url) {
    return {
      "source" : source,
      "type" : type,
      "date" : date,
      "desc" : description,
      "url" : url
    }
  },
  "user" : function(username, creds) {
    return {
      "username" : username,
      "creds" : creds
    }
  },
  "cred" : function(service, userId, name, oauth_token, oauth_secret) {
    return {
      "service" : service,
      "userId" : userId,
      "name" : name,
      "oauth" : {
        "token" : oauth_token,
        "secret" : oauth_secret
      }
    }
  }
};

exports.datatypes = datatypes;