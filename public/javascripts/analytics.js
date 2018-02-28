(function (appICEWeb) {
  // set global variables
  appICEWeb.appId = "";
  appICEWeb.appKey = "";
  appICEWeb.apiKey = "";
  appICEWeb.API_URL = "http://stagingpanel.appice.io";
  appICEWeb.error = null;
  appICEWeb.success = "";

  // set required params
  appICEWeb.set = function (key, value) {
    if (key == "app_id") {
      appICEWeb.appId = value
    } else if (key == "app_key") {
      appICEWeb.appKey = value
    } else if (key == "api_key") {
      appICEWeb.apiKey = value
    }
  }

  // error handler
  appICEWeb.on = function (event, callback) {
    if (event == "error") { }
    callback(appICEWeb.error);
    if (event == "success") {
      callback(appICEWeb.error, appICEWeb.success);
    }
  }

  // set event
  appICEWeb.setEvent = function (eventName, segment) {
    console.log('The eventName is: ' + eventName);
    location(function (geoLoc) {

      console.log('The GeoLoc is: ' + geoLoc);
      // appid validation
      if (appICEWeb.appId == '') {
        console.log("please set app_id");
        return;
      }
      // appkey validation
      if (appICEWeb.appKey == '') {
        console.log("please set app_key");
        return;
      }
      // apikey validation
      if (appICEWeb.apiKey == '') {
        console.log("please set api_key");
        return;
      }

      // event name validation
      if (eventName == '' || eventName == undefined) {
        console.log("Enter event name");
        return;
      }

      var eventData = {};
      eventData.key = eventName;
      eventData.app_key = appICEWeb.appKey;
      eventData.app_id = appICEWeb.appId;
      eventData.api_key = appICEWeb.apiKey;
      eventData.androidid = '';
      eventData.mstimestamp = (new Date).getTime();
      eventData.timestamp = parseInt(eventData.mstimestamp / 1000);
      eventData.eventTime = parseInt(eventData.mstimestamp / 1000);
      eventData.tz = eventData.timestamp - eventData.eventTime;
      eventData.context = {
        "where": {
          "location": {
            "place": "other"
          },
          "geo": {},
          "gpsloc": {
            "lat": geoLoc.lat,
            "lon": geoLoc.lon
          }
        },
        "what": {},
        "who": {
          "device": {
            "sdkv": "SDK_v1.0.0",
            "d": getBrowserDetails().objbrowserName,
            "r": getScreenDetails().height + 'x' + getScreenDetails().width,
            "p": "web",
            "pr": getBrowserDetails().objplatform,
            "pv": getBrowserDetails().objfullVersion,
            "l": getBrowserDetails().objlanguage,
            "av": "1.0",
            "be": getBrowserDetails().objproduct
          },
          "refname": "self",
        },
        "when": {
          "timestamp": eventData.timestamp
        }
      };

      var events = [{
        "timestamp": eventData.timestamp,
        "context": eventData.context,
        "did": eventData.did,
        "_tz": eventData.tz,
        "key": eventName,
        "eventTime": eventData.eventTime, 
        "sid": getSession()
      }];

      //segment validation
      if (segment && typeof segment === 'object') {
        events[0].segmentation = segment;
      }

      // check unique id
      checkUniqueID(function (did) {
        console.log('In check unique id.');
        eventData.did = did;
        appICEWeb.sendData(eventData, events);
        console.log(JSON.stringify(events));
      });
    });
  }

  appICEWeb.sendData = function (eventData, events) {
    var request = createXMLHttp();
    var data = {
      api_key: eventData.api_key,
      app_id: eventData.app_id,
      app_key: eventData.app_key,
      device_id: eventData.did,
      timestamp: eventData.timestamp,
      mtimestamp: eventData.mstimestamp,
      eventTime: eventData.eventTime,
      events: events
    }

    request.open('POST', appICEWeb.API_URL + '/i/V1/events', true);
    request.setRequestHeader('Content-Type', 'application/json');
    // request.setRequestHeader('Access-Control-Allow-Origin', '*');
    // request.setRequestHeader('Access-Control-Allow-Methods', 'POST');
    // request.setRequestHeader('Access-Control-Allow-Credentials', true);
    // request.setRequestHeader('Content-Type', 'multipart/form-data');
    // request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    request.onreadystatechange = function () {
      if (request.readyState === 4) {
        if (request.status === 200) {
          appICEWeb.success = request.responseText;
          console.log(request.responseText);
        } else {
          appICEWeb.success = request.responseText;
        }
      }
    }
    request.send(JSON.stringify(data));
  }

  function createXMLHttp() {
    //If XMLHttpRequest is available then using it
    if (typeof XMLHttpRequest !== undefined) {
      return new XMLHttpRequest;
      //if window.ActiveXObject is available than the user is using IE...so we have to create the newest version XMLHttp object
    } else if (window.ActiveXObject) {
      var ieXMLHttpVersions = ['MSXML2.XMLHttp.5.0', 'MSXML2.XMLHttp.4.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp', 'Microsoft.XMLHttp'],
        xmlHttp;
      //In this array we are starting from the first element (newest version) and trying to create it. If there is an
      //exception thrown we are handling it (and doing nothing ^^)
      for (var i = 0; i < ieXMLHttpVersions.length; i++) {
        try {
          xmlHttp = new ActiveXObject(ieXMLHttpVersions[i]);
          return xmlHttp;
        } catch (e) { }
      }
    }
  }

  function location(callback) {
    console.log('entered location.')
    var loc = {
      lat: '',
      lon: ''
    };
    if (navigator.geolocation) {
      //console.log("keys   " + (Object.keys(navigator.geolocation).length))
      if (Object.keys(navigator.geolocation).length > 0) {
        navigator.geolocation.getCurrentPosition(function (position) {
          loc.lat = position.coords.latitude;
          loc.lon = position.coords.longitude;
          return callback(loc);
        });
      }
      else {
        return callback(loc);
      }
    } else {
      return callback(loc);
    }
  }

  function getScreenDetails() {
    return screen;
  }

  function getUniqueId(appId, apiKey, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', 'http://stagingpanel.appice.io/o/webevents/getUniqueID?app_id=' + appId + '&api_key=' + apiKey, false);
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          appICEWeb.success = true;
          var response = JSON.parse(httpRequest.responseText);
          var cookie = setCookie('did', response);
          return callback(null, cookie);
        } else {
          appICEWeb.success = false;
          return callback(JSON.parse(httpRequest.responseText), null);
        }
      }
    }
    httpRequest.send();
  }

  function getCookie(cookiename) {
    var nameEQ = cookiename + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function setCookie(did, value) {
    return document.cookie = did + "=" + value + ";";
  }

  function generateSessionID() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 24; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  function getSession() {
    if (document.cookie.includes("appice_sess")) {
      var nameEQ = "appice_sess=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) {
          return c.substring(nameEQ.length, c.length);
        }
      }
    }
    else {
      return setSession();
    }
  }

  function setSession() {
    var sessionID = "appice_sess=" + generateSessionID() + ";";
    document.cookie = sessionID;
    appICEWeb.setEvent('Session_Start');
    return sessionID;
  }

  function getBrowserDetails() {
    var browser = {};
    browser.objproduct = navigator.product;
    browser.objlanguage = navigator.language;
    browser.objplatform = navigator.platform;
    browser.objappVersion = navigator.appVersion;
    browser.objAgent = navigator.userAgent;
    browser.objbrowserName = navigator.appName;
    browser.objfullVersion = '' + parseFloat(navigator.appVersion);
    browser.objBrMajorVersion = parseInt(navigator.appVersion, 10);
    browser.objOffsetName = '';
    browser.objOffsetVersion = '';
    browser.ix = '';

    // In Chrome
    if ((browser.objOffsetVersion = browser.objAgent.indexOf("Chrome")) != -1) {
      browser.objbrowserName = "Chrome";
      browser.objfullVersion = browser.objAgent.substring(browser.objOffsetVersion + 7);
    }

    // In Microsoft internet explorer
    else if ((browser.objOffsetVersion = browser.objAgent.indexOf("MSIE")) != -1) {
      browser.objbrowserName = "Microsoft Internet Explorer";
      browser.objfullVersion = browser.objAgent.substring(browser.objOffsetVersion + 5);
    }

    // In Firefox
    else if ((browser.objOffsetVersion = browser.objAgent.indexOf("Firefox")) != -1) {
      browser.objbrowserName = "Firefox";
    }

    // In Safari
    else if ((browser.objOffsetVersion = browser.objAgent.indexOf("Safari")) != -1) {
      browser.objbrowserName = "Safari";
      browser.objfullVersion = browser.objAgent.substring(browser.objOffsetVersion + 7);

      if ((browser.objOffsetVersion = browser.objAgent.indexOf("Version")) != -1) browser.objfullVersion = browser.objAgent.substring(browser.objOffsetVersion + 8);
    }

    // For other browser "name/version" is at the end of userAgent
    else if ((browser.objOffsetName = browser.objAgent.lastIndexOf(' ') + 1) < (browser.objOffsetVersion = browser.objAgent.lastIndexOf('/'))) {
      browser.objbrowserName = browser.objAgent.substring(browser.objOffsetName, browser.objOffsetVersion);
      browser.objfullVersion = browser.objAgent.substring(browser.objOffsetVersion + 1);
      if (objbrowserName.toLowerCase() == browser.objbrowserName.toUpperCase()) {
        browser.objbrowserName = navigator.appName;
      }
    }
    // trimming the fullVersion string at semicolon/space
    // if present if ((ix=browser.objfullVersion.indexOf(";"))!=-1) browser.objfullVersion=browser.objfullVersion.substring(0,ix);
    // if ((ix=browser.objfullVersion.indexOf(" "))!=-1) browser.objfullVersion=browser.objfullVersion.substring(0,ix);
    // browser.objBrMajorVersion = parseInt(''+browser.objfullVersion,10);
    if (isNaN(browser.objBrMajorVersion)) {
      browser.objfullVersion = '' + parseFloat(navigator.appVersion);
      browser.objBrMajorVersion = parseInt(navigator.appVersion, 10);
    }
    return browser;
  }

  //mark install when user get unique id
  function install() {
    location(function (geoLoc) {
      let mstimestamp = (new Date).getTime();
      let timestamp = parseInt(mstimestamp / 1000);
      let _tz = timestamp - timestamp;
      let metrics = {
        "_locale": getBrowserDetails().objlanguage,
        "_ref": "self",
        "_app_version": "",
        "_device": "web", //getBrowserDetails().objbrowserName,
        "_resolution": getScreenDetails().height + 'x' + getScreenDetails().width,
        "_tz": _tz,
        "_os_version": getBrowserDetails().objfullVersion,
        "context": {
          "where": {
            "location": {
              "place": "other"
            },
            "geo": {},
            "gpsloc": {
              "lat": geoLoc.lat,
              "lon": geoLoc.lon
            }
          },
          "what": {},
          "who": {
            "device": {
              "sdkv": "SDK_v1.0.0",
              "d": "web",
              "r": getScreenDetails().height + 'x' + getScreenDetails().width,
              "p": "web",
              "pr": getBrowserDetails().objplatform,
              "pv": getBrowserDetails().objfullVersion,
              "l": getBrowserDetails().objlanguage,
              "av": "1.0",
              "na": getBrowserDetails().objbrowserName,
              "be": getBrowserDetails().objproduct
            },
            "refname": "self",
          },
          "when": {
            "timestamp": timestamp
          }
        },
        "_os": "web",
        "_carrier": "NA",
        "_app_code": "3",
        "_app_package": getBrowserDetails().objAgent,
        "_installer": "self"
      };

      var request = createXMLHttp();
      request.open('GET', encodeURI(appICEWeb.API_URL + '/i/V1/initialize?api_key=' + appICEWeb.apiKey + '&app_id=' + appICEWeb.appId + '&app_key=' + appICEWeb.appKey + '&device_id=' + getCookie('did') + '&timestamp=' + timestamp + '&sdk_version=1.0&inittime=' + timestamp + '&mtimestamp=' + mstimestamp + '&metrics=' + JSON.stringify(metrics)), true);
      request.setRequestHeader('Content-Type', 'application/json');
      request.setRequestHeader('Access-Control-Allow-Origin', '*');
      request.setRequestHeader('Access-Control-Allow-Methods', 'GET');
      request.setRequestHeader('Access-Control-Allow-Credentials', true);
      request.send();
      request.onreadystatechange = function () {
        if (request.readyState === 4) {
          if (request.status === 200) {
            appICEWeb.success = request.responseText;
            console.log(request.responseText);
          } else {
            appICEWeb.success = request.responseText;
          }
        }
      }
    });
  }

  //validate or check unique id for web
  function checkUniqueID(callback) {
    if (getCookie('did') && getCookie('did') != 'undefined') {
      callback(getCookie('did'));
    } else {
      getUniqueId(appICEWeb.appId, appICEWeb.apiKey, function (err, response) {
        if (err) {
          console.log(err);
        } else {
          install();
          callback(response);
        }
      });
    }
  };

  // send session start
  getSession();

  window.onbeforeunload = function () {
    alert('exit')
    appICEWeb.setEvent('Session_End');
  }
}(window.appICEWeb = window.appICEWeb || {}));
