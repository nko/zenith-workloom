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
  sys.log("Client: " + ctzo + ", User: " + tzo);
  ctzo = (tzo - ctzo) * (1000*60*60);
  for(var i = 0; i < acts.length; i++) {
    sys.log("Before " + acts[i].date);
    acts[i].date = new Date(new Date(acts[i].date) - ctzo);
    sys.log("After " + acts[i].date);
  }
  return acts;
}

datatypeFunctions = {
  sortActions : function(acts) {
    acts.sort(function(a, b) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  },

  processAndSortActions : function(tzo, acts) {
    acts = fixTimeZones(tzo, acts);
    this.sortActions(acts);
    var start = new Date(acts[0].date), startDay = start.getDay(), result = [], items = [];
    
    for(var i = 0; i < acts.length; i++) {
      var act = acts[i], ad = new Date(act.date), adDay = ad.getDay();
      sys.log("START: " + startDay + ", ad: " + adDay);
      
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
    sys.log(sys.inspect(result));
    return result;
  }
};

exports.datatypes = datatypes;
exports.datatypeFunctions = datatypeFunctions;