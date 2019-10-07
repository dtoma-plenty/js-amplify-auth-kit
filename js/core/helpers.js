function sanitize(payload) {
	var output;
	if (payload && !Number.isInteger(payload)) {
		output = payload.replace(/<(|\/|[^>\/bi]|\/[^>bi]|[^\/>][^>]+|\/[^>][^>]+)>/g, '');	
	}
	else {
		
		output = payload;
	}
	return output;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function showError(msg,attachToField) {    
	console.log(attachToField);
	if (!attachToField) {
	    $(".error-container").each(function() {
	         $(this).html(msg);
	        $(this).css({
	           display: "block" 
	        });
	    });		
	}
	else {
		attachToField.parents(".form-group").find(".field-error-msg").remove();
		attachToField.parents(".form-group").wrap('<div class="field-has-error"></div>');
		attachToField.parents(".form-group").append('<div class="field-error-msg">'+msg+'</div>');
	}
}
function hideAttachedError(field) {
	field.parents(".form-group").find(".field-error-msg").remove();
}
function hideError() {
    $(".error-container").each(function() {
        $(this).html("");
        $(this).css({
           display: "none" 
        });
    });
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

function parseJwt (token) {
    try {
    	return jwt_decode(token);
    }
    catch(err) {
    	console.log(err);    	
    	alert("An error occoured while trying to log you in");
    }
}

function parseJwtAndReturnHeader (token) {
	try {
    	return jwt_decode(token);
    }
    catch(err) {
    	console.log(token);
    	console.log(err);    	
    	alert("An error occoured while trying to log you in");
    }
    
}

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

function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


function isEmail(email) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  return regex.test(email);
}

function showLoading(hideSpinner) {
	if (hideSpinner && hideSpinner === true) {
	    $(".ajax-loading-wrapper").addClass("ajax-loading-wrapper-visible").addClass("ajax-no-spinner");		
	}
	else {
		$(".ajax-loading-wrapper").addClass("ajax-loading-wrapper-visible");
	}
}

function hideLoading() {
    $(".ajax-loading-wrapper").removeClass("ajax-loading-wrapper-visible").removeClass("ajax-no-spinner");
}

function showPageLoading() {
    $(".ajax-page-loader").removeClass("ajax-page-loader-hidden");
}

function hidePageLoading() {
    $(".ajax-page-loader").addClass("ajax-page-loader-hidden");
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function updateQueryStringParameter(uri, key, value) {
	  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
	  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
	  if (uri.match(re)) {
	    return uri.replace(re, '$1' + key + "=" + value + '$2');
	  }
	  else {
	    return uri + separator + key + "=" + value;
	  }
}
