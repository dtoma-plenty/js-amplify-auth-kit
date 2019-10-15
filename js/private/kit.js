import * as helper from './helpers.js';
import * as cfg from './config.js';

// Auth functions

var ts = Math.round((new Date()).getTime() / 1000);
var refreshToken = null;

function isAuthenticated() {
    var queryString = helper.parseQueryString(window.location.href);
	var access_token = queryString.access_token;
	var refresh_token = queryString.refresh_token;
    var result = false;
    var token = access_token;

    // Auth token logic
    
    if (access_token) {
        helper.eraseCookie(fpPortalConfig.awsCookieName);
		helper.setCookie(fpPortalConfig.awsCookieName,access_token,30);
		token = helper.getCookie(fpPortalConfig.awsCookieName);
    }

		var tokenObj = helper.parseJwt(token);
		if (token && typeof(token) !== "undefined") {
		var tokenObj = helper.parseJwt(token);
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
	            url: fpPortalConfig.refreshEndpoint+params,
	            type: 'GET',
	            success: function(res) {
					helper.eraseCookie(fpPortalConfig.awsCookieName);
					helper.setCookie(fpPortalConfig.awsCookieName,res.idToken,30);
	                   
	                   // After getting the new access token call the isAuthenticated 
	                   // function again to trigger the expiration time verification
	                   
	                   onAuthenticated();
	            },
	            error: function() {
	            	 window.location.href=fpPortalConfig.logoutEndpoint;
	            }
	        });
			
		}
    }
    return result;
}

function onAuthenticated() {

	var queryString = helper.parseQueryString(window.location.href);
	var lang = queryString.lang;
	if (lang) {
		lang = queryString.lang.replace("#", "");
		helper.eraseCookie(cfg.authCfg.langCookieName);
		helper.setCookie(cfg.authCfg.langCookieName,lang,30);
	}

    var token = helper.getCookie(cfg.authCfg.awsCookieName);
    var tokenObj = helper.parseJwt(token);
    $("body").animate({
        opacity: 1
    });
}

function checkAuth() {	
	if (isAuthenticated() === true) { 
        onAuthenticated();
    }
    else { 
		helper.eraseCookie(cfg.authCfg.awsCookieName);
		helper.eraseCookie(cfg.authCfg.awsRefreshCookieName);
		// window.location.href=fpPortalConfig.ssoEndpoint;
		window.location.href=fpPortalConfig.loginEndpoint+"?lang="+fpPortalConfig.appLang+"&app_name="+fpPortalConfig.appName+"&app_root="+window.location.href;
        // doLogout();   
    }
	
}

function doLogout() {
    helper.eraseCookie(cfg.authCfg.awsCookieName);
    helper.eraseCookie(cfg.authCfg.awsRefreshCookieName);
    window.location.href=fpPortalConfig.logoutEndpoint;
}

function checkTokenExpiration() {
	var currentTime = Math.round((new Date()).getTime() / 1000);
	var currentTimePlusTen = currentTime + 10*60;
	var queryString = helper.parseQueryString(window.location.href);
	var access_token = queryString.access_token.replace('-', '+').replace('_', '/');
	var refresh_token = queryString.refresh_token;
    var cookieToken = helper.getCookie(fpPortalConfig.awsCookieName);
    var token = access_token;
    
    if (cookieToken) {
    	token = cookieToken;
    }
    else {
        helper.eraseCookie(fpPortalConfig.awsCookieName);
        helper.setCookie(fpPortalConfig.awsCookieName,access_token,30);  	
    }

    if (token !== "null") {    	
    	
    	var tokenObj = helper.parseJwt(token);
		var tokenExp = tokenObj.exp;
		var userPoolId = tokenObj.iss.split(/[/ ]+/).pop();
		var clientName = queryString.app_name;
		
    	if (currentTimePlusTen >= tokenExp) {
    		
    		// Token is about to expire within the next ten minutes
    		var params = '?refreshToken='+refresh_token+'&userPoolId='+userPoolId+'&clientName='+clientName;
	        $.ajax({
	            url: fpPortalConfig.refreshEndpoint+params,
	            type: 'GET',
	            success: function(res) {
						helper.eraseCookie(fpPortalConfig.awsCookieName);
						helper.setCookie(fpPortalConfig.awsCookieName,res.idToken,30);
	                   
	                   // After getting the new access token call the isAuthenticated 
	                   // function again to trigger the expiration time verification
	                   
	                   onAuthenticated();
	            },
	            error: function() {
	            	 window.location.href=fpPortalConfig.logoutEndpoint;
	            }
	        });
    		
    	} 
    	console.log("%c=================================================================\n [portal.ONE auth kit]: Token will expire at: "+ helper.timeConverter(tokenExp)+"\n=================================================================", "background: #2b61cd; color: #FFF");
    }
}

function debugRefresh() {
	var currentTime = Math.round((new Date()).getTime() / 1000);
	var currentTimePlusTen = currentTime + 10*60;
	var queryString = helper.parseQueryString(window.location.href);
	var access_token = queryString.access_token.replace('-', '+').replace('_', '/');
	var refresh_token = queryString.refresh_token;
    var cookieToken = helper.getCookie(fpPortalConfig.awsCookieName);
    var token = access_token;
    
    if (cookieToken) {
    	token = cookieToken;
    }
    else {
        helper.eraseCookie(fpPortalConfig.awsCookieName);
        helper.setCookie(fpPortalConfig.awsCookieName,access_token,30);  	
    }

    if (token !== "null") {    	
    	
    	var tokenObj = helper.parseJwt(token);
		var tokenExp = tokenObj.exp;
		var userPoolId = tokenObj.iss.split(/[/ ]+/).pop();
		var clientName = queryString.app_name;
		
    	if (currentTimePlusTen <= tokenExp) {
    		
    		// Token is about to expire within the next ten minutes
    		var params = '?refreshToken='+refresh_token+'&userPoolId='+userPoolId+'&clientName='+clientName;
	        $.ajax({
	            url: fpPortalConfig.refreshEndpoint+params,
	            type: 'GET',
	            success: function(res) {
						helper.eraseCookie(fpPortalConfig.awsCookieName);
						helper.setCookie(fpPortalConfig.awsCookieName,res.idToken,30);
	                   
	                   // After getting the new access token call the isAuthenticated 
	                   // function again to trigger the expiration time verification
	                   
	                   onAuthenticated();
	            },
	            error: function() {
	            	 window.location.href=fpPortalConfig.logoutEndpoint;
	            }
	        });
    		
    	} 
    	console.log("%c=================================================================\n [portal.ONE auth kit]: Token will expire at: "+ helper.timeConverter(tokenExp)+"\n=================================================================", "background: #2b61cd; color: #FFF");
    }
	
	
	
}

// On AJAX error, if the returned code is 401, than the refresh token has expired and the user ahs to be logged out

$(document).ajaxError(function(event, jqxhr, settings, thrownError) {
  var status = jqxhr.status;
  if (status === 401) {
	helper.eraseCookie(fpPortalConfig.awsCookieName);
	helper.eraseCookie(fpPortalConfig.awsRefreshCookieName);
	    window.location.href=fpPortalConfig.logoutEndpoint;
  }
});

// Check the access token for expiration. If the token is expiring within the next 10 minutes than trigger the refresh mechanism

$(document).ready(function() {
	checkAuth();
	setInterval(function() {
		checkTokenExpiration();
	},cfg.authCfg.tokenCheckInterval)
});

// Append token to all ajax requests in the client

$.ajaxSetup({
    beforeSend: function (xhr)
    {
	   xhr.setRequestHeader("Authorization","Bearer "+helper.getCookie(fpPortalConfig.awsCookieName)); 
	   xhr.setRequestHeader("x-api-lang",helper.getCookie(fpPortalConfig.langCookieName));       
    }
});