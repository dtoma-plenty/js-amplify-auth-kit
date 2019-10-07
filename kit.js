

// Auth functions

var ts = Math.round((new Date()).getTime() / 1000);
var refreshToken = null;

function parseQueryString(url) {
    var urlParams = {};
    url.replace(
      new RegExp("([^?=&]+)(=([^&]*))?", "g"),
      function($0, $1, $2, $3) {
        urlParams[$1] = $3;
      }
    );
    
    return urlParams;
  }

function parseJwt (token) {
    try {
		token = token.replace('-', '+').replace('_', '/');
    	return jwt_decode(token);
    }
    catch(err) {
    	console.log(err);
    }
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)===' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) !== -1) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function isAuthenticated() {
    var queryString = parseQueryString(window.location.href);
	var access_token = queryString.access_token;
	var refresh_token = queryString.refresh_token;
    var result = false;
    var token = access_token;

    // Auth token logic
    
    if (access_token) {
        eraseCookie(cfg.awsCookieName);
		setCookie(cfg.awsCookieName,access_token,30);
		token = getCookie(cfg.awsCookieName);
    }

    if (typeof(token) !== "undefined") {
		var tokenObj = parseJwt(token);
		var tokenExp = tokenObj.exp;
		var userPoolId = tokenObj.iss.split(/[/ ]+/).pop();
		var clientName = queryString.app_name;

    	// If the token isn't expired
		if (ts <= tokenExp) {
			result = true;
		}
		else {
			
			// If the access token is present but expired get a new access token
	        
	        var params = '?refreshToken='+refresh_token+'&userPoolId='+userPoolId+'&clientName='+clientName;
	        $.ajax({
	            url: cfg.refreshEndpoint+params,
	            type: 'GET',
	            success: function(res) {
	            	   eraseCookie(cfg.awsCookieName);
	                   setCookie(cfg.awsCookieName,res.idToken,30);
	                   
	                   // After getting the new access token call the isAuthenticated 
	                   // function again to trigger the expiration time verification
	                   
	                   onAuthenticated();
	            },
	            error: function() {
	            	 window.location.href=cfg.logoutEndpoint;
	            }
	        });
			
		}
    }
    return result;
}

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/"; 
}

function onAuthenticated() {

	var queryString = parseQueryString(window.location.href);
	var lang = queryString.lang.replace("#", "");
	if (lang) {
		eraseCookie(cfg.langCookieName);
		setCookie(cfg.langCookieName,lang,30);
	}

    var token = getCookie(cfg.awsCookieName);
    var tokenObj = parseJwt(token);
    $("body").animate({
        opacity: 1
    });
    $(".user-action span").html("Hello "+tokenObj.name);
}

function checkAuth() {	
	if (isAuthenticated() === true) { 
        onAuthenticated();
    }
    else { 
		eraseCookie(cfg.awsCookieName);
		eraseCookie(cfg.awsRefreshCookieName);
		window.location.href=cfg.ssoEndpoint;
        // doLogout();   
    }
	
}

function doLogout() {
    eraseCookie(cfg.awsCookieName);
    eraseCookie(cfg.awsRefreshCookieName);
    window.location.href=cfg.logoutEndpoint;
}

function timeConverter(UNIX_timestamp){
	  var a = new Date(UNIX_timestamp * 1000);
	  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var year = a.getFullYear();
	  var month = months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
	  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
	  return time;
	}

function checkTokenExpiration() {
	var currentTime = Math.round((new Date()).getTime() / 1000);
	var currentTimePlusTen = currentTime + 10*60;
	var queryString = parseQueryString(window.location.href);
	var access_token = queryString.access_token.replace('-', '+').replace('_', '/');
	var refresh_token = queryString.refresh_token;
    var cookieToken = getCookie(cfg.awsCookieName);
    var token = access_token;
    
    if (cookieToken) {
    	token = cookieToken;
    }
    else {
        eraseCookie(cfg.awsCookieName);
        setCookie(cfg.awsCookieName,access_token,30);  	
    }

    if (token !== "null") {    	
    	
    	var tokenObj = parseJwt(token);
		var tokenExp = tokenObj.exp;
		var userPoolId = tokenObj.iss.split(/[/ ]+/).pop();
		var clientName = queryString.app_name;
		
    	if (currentTimePlusTen >= tokenExp) {
    		
    		// Token is about to expire within the next ten minutes
    		var params = '?refreshToken='+refresh_token+'&userPoolId='+userPoolId+'&clientName='+clientName;
	        $.ajax({
	            url: cfg.refreshEndpoint+params,
	            type: 'GET',
	            success: function(res) {
	            	   eraseCookie(cfg.awsCookieName);
	                   setCookie(cfg.awsCookieName,res.idToken,30);
	                   
	                   // After getting the new access token call the isAuthenticated 
	                   // function again to trigger the expiration time verification
	                   
	                   onAuthenticated();
	            },
	            error: function() {
	            	 window.location.href=cfg.logoutEndpoint;
	            }
	        });
    		
    	} 
    	console.log("%c=================================================================\n [portal.ONE auth kit]: Token will expire at: "+ timeConverter(tokenExp)+"\n=================================================================", "background: #2b61cd; color: #FFF");
    }
	
	
	
}

function debugRefresh() {
	var currentTime = Math.round((new Date()).getTime() / 1000);
	var currentTimePlusTen = currentTime + 10*60;
	var queryString = parseQueryString(window.location.href);
	var access_token = queryString.access_token.replace('-', '+').replace('_', '/');
	var refresh_token = queryString.refresh_token;
    var cookieToken = getCookie(cfg.awsCookieName);
    var token = access_token;
    
    if (cookieToken) {
    	token = cookieToken;
    }
    else {
        eraseCookie(cfg.awsCookieName);
        setCookie(cfg.awsCookieName,access_token,30);  	
    }

    if (token !== "null") {    	
    	
    	var tokenObj = parseJwt(token);
		var tokenExp = tokenObj.exp;
		var userPoolId = tokenObj.iss.split(/[/ ]+/).pop();
		var clientName = queryString.app_name;
		
    	if (currentTimePlusTen <= tokenExp) {
    		
    		// Token is about to expire within the next ten minutes
    		var params = '?refreshToken='+refresh_token+'&userPoolId='+userPoolId+'&clientName='+clientName;
	        $.ajax({
	            url: cfg.refreshEndpoint+params,
	            type: 'GET',
	            success: function(res) {
	            	   eraseCookie(cfg.awsCookieName);
	                   setCookie(cfg.awsCookieName,res.idToken,30);
	                   
	                   // After getting the new access token call the isAuthenticated 
	                   // function again to trigger the expiration time verification
	                   
	                   onAuthenticated();
	            },
	            error: function() {
	            	 window.location.href=cfg.logoutEndpoint;
	            }
	        });
    		
    	} 
    	console.log("%c=================================================================\n [portal.ONE auth kit]: Token will expire at: "+ timeConverter(tokenExp)+"\n=================================================================", "background: #2b61cd; color: #FFF");
    }
	
	
	
}

// On AJAX error, if the returned code is 401, than the refresh token has expired and the user ahs to be logged out

$(document).ajaxError(function(event, jqxhr, settings, thrownError) {
  var status = jqxhr.status;
  if (status === 401) {
	    eraseCookie(cfg.awsCookieName);
	    eraseCookie(cfg.awsRefreshCookieName);
	    window.location.href=cfg.logoutEndpoint;
  }
});

// Check the access token for expiration. If the token is expiring within the next 10 minutes than trigger the refresh mechanism

$(document).ready(function() {
	checkAuth();
	setInterval(function() {
		checkTokenExpiration();
	},cfg.tokenCheckInterval)
});

// Append token to all ajax requests in the client

$.ajaxSetup({
    beforeSend: function (xhr)
    {
	   xhr.setRequestHeader("Authorization","Bearer "+getCookie(cfg.awsCookieName)); 
	   xhr.setRequestHeader("x-api-lang",getCookie(cfg.langCookieName));       
    }
});