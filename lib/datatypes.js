var sys = require("sys");

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

function fixTimeZones(tzo, acts) {
  var ctzo = new Date().getTimezoneOffset()/60;
  ctzo = (tzo - ctzo) * (1000*60*60);
  for(var i = 0; i < acts.length; i++) {
    acts[i].date = new Date(new Date(acts[i].date) - ctzo);
  }
  return acts;
}

datatypeFunctions = {
  sortActions : function(acts) {
    acts.sort(function(a, b) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  },

  processAndSortActions : function(tzo, acts, callback) {
    acts = fixTimeZones(tzo, acts);
    this.sortActions(acts);
    var start = new Date(acts[0].date), startDay = start.getDay(), result = [], items = [];
    
    for(var i = 0; i < acts.length; i++) {
      var act = acts[i], ad = new Date(act.date), adDay = ad.getDay();
      
      if(adDay == startDay) {
        items.push(act);
      }
      else {
        result.push( {
          "date" : start,
          "items" : items
        });
        items = [act];
        start = ad;
        startDay = start.getDay();
      }
    }
    callback(result);
  }
};

exports.datatypes = datatypes;
exports.datatypeFunctions = datatypeFunctions;