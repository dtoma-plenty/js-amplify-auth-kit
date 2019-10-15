
import * as cfg from './config.js';
import jwt_decode from 'jwt-decode';

export function sanitize(payload) {
	var output;
	if (payload && !Number.isInteger(payload)) {
		output = payload.replace(/<(|\/|[^>\/bi]|\/[^>bi]|[^\/>][^>]+|\/[^>][^>]+)>/g, '');	
	}
	else {
		
		output = payload;
	}
	return output;
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function showLoading(hideSpinner) {
	if (hideSpinner && hideSpinner === true) {
	    $(".ajax-loading-wrapper").addClass("ajax-loading-wrapper-visible").addClass("ajax-no-spinner");		
	}
	else {
		$(".ajax-loading-wrapper").addClass("ajax-loading-wrapper-visible");
	}
}

export function hideLoading() {
    $(".ajax-loading-wrapper").removeClass("ajax-loading-wrapper-visible").removeClass("ajax-no-spinner");
}

export function showError(msg,attachToField) { 
	if (!attachToField) {
	    $(".error-container").each(function() {
	         $(this).html(msg);
	        $(this).css({
	           display: "block" 
	        });
	    });		
	}
	else {
    
    if (!attachToField.parents(".form-group").parents('.field-has-error').length) {
      attachToField.parents(".form-group").find(".field-error-msg").remove();
      attachToField.parents(".form-group").wrap('<div class="field-has-error"></div>');
      attachToField.parents(".form-group").append('<div class="field-error-msg">'+msg+'</div>');

    }
	}
}
export function hideAttachedError(field) {
  field.parents(".form-group").find(".field-error-msg").remove();
  if (field.parents(".form-group").parents('.field-has-error').length) {
    field.parents(".form-group").unwrap();
  }
}
export function hideError() {
    $(".error-container").each(function() {
        $(this).html("");
        $(this).css({
           display: "none" 
        });
    });
}

export function root() {

    function NestedSetterAndGetter(){
      function setValueByArray(obj, parts, value){
  
        if(!parts){
          throw 'No parts array passed in';
        }
  
        if(parts.length === 0){
          throw 'parts should never have a length of 0';
        }
  
        if(parts.length === 1){
          obj[parts[0]] = value;
        } else {
          var next = parts.shift();
  
          if(!obj[next]){
            obj[next] = {};
          }
          setValueByArray(obj[next], parts, value);
        }
      }
  
      function getValueByArray(obj, parts, value){
  
        if(!parts) {
          return null;
        }
  
        if(parts.length === 1){
          return obj[parts[0]];
        } else {
          var next = parts.shift();
  
          if(!obj[next]){
            return null;
          }
          return getValueByArray(obj[next], parts, value);
        }
      }
  
      this.set = function(obj, path, value) {
        setValueByArray(obj, path.split('.'), value);
      };
  
      this.get = function(obj, path){
        return getValueByArray(obj, path.split('.'));
      };
  
    }
    root.NestedSetterAndGetter = NestedSetterAndGetter;
  
  }

export function get(obj, key) {
    var setter = new NestedSetterAndGetter();
    return setter.get(obj, key) ? setter.get(obj, key) : "";
}

export function set(obj, key,value) {
    var setter = new NestedSetterAndGetter();
    return setter.set(obj, key,value);
}

export function timeConverter(UNIX_timestamp){
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

export function setCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export function clearPasswordForm() {
	var i1 = $("#change_verification_code");
	var i2 = $("#change_password"); 
	var i3 = $("#change_repeat_password");
	var i4 = $("#forgot_pass_email");
	i1.val("");
	i2.val("");
	i3.val("");
	i4.val("");
}

export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)===' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) !== -1) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

export function parseJwt (token) {
    try {
    	return jwt_decode(token);
    }
    catch(err) {
      window.location.href=fpPortalConfig.loginEndpoint+"?lang="+fpPortalConfig.appLang+"&app_name="+fpPortalConfig.appName+"&app_root="+window.location.href
    }
}

export function parseJwtAndReturnHeader (token) {
	try {
    	return jwt_decode(token);
    }
    catch(err) {
      window.location.href=fpPortalConfig.loginEndpoint+"?lang="+fpPortalConfig.appLang+"&app_name="+fpPortalConfig.appName+"&app_root="+window.location.href
    }
    
}

export function parseQueryString(url) {
  var urlParams = {};
  url.replace(
    new RegExp("([^?=&]+)(=([^&]*))?", "g"),
    function($0, $1, $2, $3) {
      urlParams[$1] = $3;
    }
  );
  
  return urlParams;
}

export function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


export function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

export function initTranslate() {    
    var langCookie = getCookie(cfg.authCfg.langCookieName);
    if (langCookie) {
        $.getScript("js/public/i18n/"+langCookie+"/translations.js", function(){
            translateHtml();
        });
    }
    else {
        $.getScript("js/public/i18n/en/translations.js", function(){
            translateHtml();
        });
    }
}

export function translateHtml() {
    $("*[data-i18n]").each( function() {
        $(this).html(i18n[$(this).attr("data-i18n")]);
    });
}
