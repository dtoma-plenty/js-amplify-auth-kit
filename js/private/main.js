var emailExists = false, formValid = false, callbackUrl = null;
var selectedServiceId = 0;
var ts = Math.round((new Date()).getTime() / 1000);
var selectedRowId = null, tenantNatureOfBusinessEnum = [], tenantStatusEnum = [], exchangeTypeEnum = [], appTypeEnum = [], idpEnum = [], serviceUrl = null, serviceCode = null, serviceInstanceUrl = null, serviceInstanceParamUrl = null;
var hoverTimer, userProfileObj, tenantObj = {}, loggedInUserData = {}, loggedInTenantData = {};
var auditStopFlag = false, auditSearchActive = false, auditHasMore = true;
var idAvatarUploadField = "upload-avatar-field";
var panelMaximized = false;
var panelToMinimize = null;
var panelToExpand = null;
var consentCookieName = "_fpEscConsent";
var regularUserHidden = ["#manageTenants","#manageServices","#manageSettings","#view-account-side-link",".profile-options","#manageAnalytics"];
var externalProviderHidden = ["#button-change-password"];
var lang = "en";
var tenantList = [], activeTenant = {}, selectedParam = null, currentEditorInstance = null, selectedServiceInstance = null;
var dragAreaMsg = $(".file-drag-msg").html(), filesArray = [];


import Amplify from '@aws-amplify/core'
import Auth from '@aws-amplify/auth';


function triggerUpload(fileFieldId) {
	var elem = document.getElementById(fileFieldId);
	if(elem && document.createEvent) {
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		elem.dispatchEvent(evt);
	}
}

function sendFeedback() {
    console.log(filesArray);
    console.log($("#feedback-input").val());
    console.log($("#feedback-category").val());
    console.log($("#feedback-type").val());
    filesArray = [];
    $(".file-drag-msg").html(dragAreaMsg);
	
    $("#feedback-input").val("");
    $("#feedback-category").val("");
	$("#feedback-type").val("");
}

function buildTenantsCombo() {
	var options = [];
	
	$.each(tenantList, function( index, value ) {
		var selected = "";
		if (Object.keys(activeTenant).length > -1 && activeTenant.refid === value.refid) {
			selected = "selected";
		}
		if (loggedInUserData.tenantId === value.refid) {
			selected = "selected";
		}
		options.push("<option "+selected+" value='"+value.refid+"'>"+value.name+"</option>");
    });
	
	return "<select id='tenants-combo-side-link'>"+options.join("")+"</select>";
}

function buildTenantsProfileCombo() {
	var options = [];
	
	$.each(tenantList, function( index, value ) {
		var selected = "";
		if (Object.keys(activeTenant).length > -1 && activeTenant.refid === value.refid) {
			selected = "selected";
		}
		if (loggedInUserData.tenantId === value.refid) {
			selected = "selected";
		}
		options.push("<option "+selected+" value='"+value.refid+"'>"+value.name+"</option>");
    });
    
    var html = "<div class='portal-label'>Choose an active tenant from the list bellow</div>";
	$(".profile-options").html(html+buildTenantsCombo());
//	$('select').selectric();
//	$('.selectric-scroll').niceScroll();
}

function setActiveTenant(value) {
	 showLoading();
     var xmlhttp = new XMLHttpRequest();
     var params = 'id='+value;
     xmlhttp.open("GET", "/api/tenants/findByRefid?projection=detail&"+params, true);
     xmlhttp.onreadystatechange = function() {
         if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {        	   
            var result = xmlhttp.responseText;
            var jsonResult = JSON.parse(result);
            activeTenant = jsonResult;
            setCookie("_fpActiveTenant",JSON.stringify(jsonResult),30);
            $('.profile-tenant').html(jsonResult.name);
            window.location.href = window.location.href;
         }
         hideLoading(); 
     };            
     xmlhttp.send(params);
}

function clearPasswordForm() {
	var i1 = $("#change_verification_code");
	var i2 = $("#change_password"); 
	var i3 = $("#change_repeat_password");
	var i4 = $("#forgot_pass_email");
	i1.val("");
	i2.val("");
	i3.val("");
	i4.val("");
}

function amazonRefresh(refreshToken,data) {  
	var authData = {
			ClientId : data.clientId,
	        AppWebDomain : loggedInTenantData.domainUrl,
	        TokenScopesArray : ["email"],
	        RedirectUriSignIn : data.callbackUrl,
	        RedirectUriSignOut : data.signOutUrl,
	        AdvancedSecurityDataCollectionFlag : false
    };
    var auth = new AmazonCognitoAuth.CognitoAuth(authData); 
    auth.userhandler = {
    	onSuccess : function(result) {
    		var token = result.idToken.jwtToken;
    		eraseCookie(portal.awsCookieName);
            setCookie(portal.awsCookieName,token,30);
    	},
    	onFailure : function() {
    		eraseCookie(portal.awsCookieName);
   	        eraseCookie(portal.awsRefreshCookieName);
   	        eraseCookie(portal.awsTenantCodeCookieName);
   	        eraseCookie("_fpActiveTenant");
   			window.location.href = "login.html";
    	}
    }
    auth.refreshSession(refreshToken);
}

function refreshIdToken(refreshToken) {
	
	var token = getCookie("_fpAuth");
    var tokenObj = parseJwt(token);
    var theUser = tokenObj.email;
	if (!theUser) {
		theUser = tokenObj.username;
	}
	
	var xmlhttp = new XMLHttpRequest();
    var params = 'email='+theUser;
    xmlhttp.open("GET", "/api/users/findByEmail?"+params, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {
           var result = xmlhttp.responseText;
           var jsonResult = JSON.parse(result);
            hideLoading();                  
            if (jsonResult.tenantId && portal.name) {
                var tenant = new XMLHttpRequest();
                var tenantParams = 'userPoolId='+jsonResult.userPoolId+"&clientName="+portal.name;
                tenant.open("GET", "api/identity-provider/getUserPoolClient?"+tenantParams, true);
                tenant.onreadystatechange = function() {
                    if (tenant.readyState === XMLHttpRequest.DONE) {
                       if (tenant.status === 200) {
                           var tenantResult = tenant.responseText;
                           var tenantJsonResult = JSON.parse(tenantResult);                                   
                            var data = {
                            	clientId : tenantJsonResult.clientId,
                            	userPoolId : tenantJsonResult.userPoolId,
                            	callbackUrl : tenantJsonResult.callbackUrl,
                            	domain : tenantJsonResult.domain,
                            	signOutUrl : tenantJsonResult.logoutUrl
                            }
                            
                            amazonRefresh(refreshToken,data);
                            
                       }
                       else {
                           hideLoading();
                       }
                    }
                };                    
                tenant.send(tenantParams);
            }
        }
    };                    
    xmlhttp.send(params);
}

function isAuthenticated() {
    var result = false;
    var token = getCookie(portal.awsCookieName);
    var refreshToken = getCookie(portal.awsRefreshCookieName);
    
    if (token !== null) {
    	
    	var tokenObj = parseJwt(token);
		var tokenExp = tokenObj.exp;
		
    	// If the token isn't expired
		if (ts <= tokenExp) {
			result = true;
		}
		else {
			// If the token expired get a new token using the refresh token
			
			// Check if the refresh token has expired
			refreshIdToken(refreshToken);
		}
    }
    return result;
}

function getLoggedInUserName() {
	var user = null;
	if (loggedInUserData) {
		user = loggedInUserData.username;
	}	
	return user;
}

function getLoggedInUserMail() {
	var user = null;
	var token = getCookie(portal.awsCookieName);
	if (token) {
		var tokenObj = parseJwt(token);
		if (tokenObj['cognito:username']) {
			user = tokenObj['cognito:username'];
		}
		else {
			user = tokenObj['email'];			
		}
	}	
	return user;
}

function getTenantRefId() {
	var tenantId = loggedInUserData.tenantId;
	if (activeTenant.refid) {
		tenantId = activeTenant.refid;
	}
	return tenantId;
}

function getTenantCode(refId, callbackFn) {
	 showLoading();
     var xmlhttp = new XMLHttpRequest();
     var params = 'id='+refId;
     xmlhttp.open("GET", "/api/tenants/findByRefid?"+params, true);
     xmlhttp.onreadystatechange = function() {
         if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {     	   
            var result = xmlhttp.responseText;
            var jsonResult = JSON.parse(result);
            var tenantCode = jsonResult.code;
            if (callbackFn) {
            	setCookie(portal.awsTenantCodeCookieName,tenantCode,30);
            	return callbackFn(tenantCode);
            }
            else {
            	return tenantCode;
            }
         }
         hideLoading(); 
     };            
     xmlhttp.send(params);
}

function getTenantNatureOfBusinessEnum() {
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/api/tenants/getTenantNatureOfBusinessList", true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {          	   
           var result = xmlhttp.responseText;
           var jsonResult = JSON.parse(result);
           $.each(jsonResult, function( index, value ) {
        	   tenantNatureOfBusinessEnum.push({
             	  label : value,
             	  value : value
                });
           });
        }
    };            
    xmlhttp.send();
}

function getTenantStatusEnum() {
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/api/tenants/getTenantStatusList", true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {     	   
           var result = xmlhttp.responseText;
           var jsonResult = JSON.parse(result);
           $.each(jsonResult, function( index, value ) {
        	   tenantStatusEnum.push({
             	  label : value,
             	  value : value
                });
           });
        }
    };            
    xmlhttp.send();
}

function setupUi() {
	var isRoot = loggedInUserData.root;
	if (!isRoot) {
		$.each(regularUserHidden, function( index, value ) {
     	   $(value).remove();
        });
	}
	hidePageLoading();
}

function getTenantList() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", "/api/tenants/findAll?page=0&size=1000&projection=detail", true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {        	   
           var result = xmlhttp.responseText;
           var jsonResult = JSON.parse(result);
           if (typeof(jsonResult._embedded) == "undefined") {
        	   hideLoading();
        	   return;
           }
           tenantList = jsonResult._embedded.tenantList;            	    
    	   buildTenantsProfileCombo();
        }
    };                    
    xmlhttp.send();
}

function getLoggedInUserData(dataTable) {
    var mail = getLoggedInUserMail();
    var xmlhttp = new XMLHttpRequest();
    var params = 'email='+mail;
    xmlhttp.open("GET", "/api/users/findByEmail?"+params, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) {         	   
           var result = xmlhttp.responseText;
           var jsonResult = JSON.parse(result);
           loggedInUserData = jsonResult;
           if (jsonResult.photo) {
        	   $('.profile-avatar-container').css({
          		background: 'url('+jsonResult.photo+') no-repeat center center',
          		backgroundSize: "65px 65px"
              });
           }
           else {
        	   $('.profile-avatar-container').css({
             		background: 'url('+jsonResult.photo+') no-repeat center center',
             		backgroundSize: "65px 65px",
             		display: "none"
                 });
           }
           
           setupUi();
           getTenantUserData(jsonResult,dataTable);
           $('.profile-name').html(loggedInUserData.firstName+" "+loggedInUserData.lastName);
           $('.profile-avatar-initials').html(loggedInUserData.firstName.charAt(0)+loggedInUserData.lastName.charAt(0));
           if (activeTenant.name) {
               $('.profile-tenant').html(activeTenant.name);
           }
           else {
        	   var tenantId2 = loggedInUserData.tenantId;               
               var xmlhttp2 = new XMLHttpRequest();
               var params2 = 'id='+tenantId2;
               xmlhttp2.open("GET", "/api/tenants/findByRefid?"+params2, true);
               xmlhttp2.onreadystatechange = function() {
                   if (xmlhttp2.readyState === XMLHttpRequest.DONE && xmlhttp2.status === 200) {
                      var result2 = xmlhttp2.responseText;
                      var jsonResult2 = JSON.parse(result2);

                      $('.profile-tenant').html(jsonResult2.name);
                   }
                   hideLoading(); 
               };            
               xmlhttp2.send(params2);
           }
           
           // Init auto-refresh mechanism
           
           setInterval(function() {
        	   refreshIdToken(getCookie(portal.awsRefreshCookieName));
       	   },60000*5);
        }
    };                    
    xmlhttp.send(params);
}

function getTenantUserData(loggedInUserData,dataTable) {
	showLoading();
	var tenant = new XMLHttpRequest();
	if (dataTable) {
		dataTable.buttons().disable();
    }
    var tenantParams = 'userPoolId='+loggedInUserData.userPoolId+"&clientName="+portal.name;
    tenant.open("GET", "api/identity-provider/getUserPoolClient?"+tenantParams, true);
    tenant.onreadystatechange = function() {
        if (tenant.readyState === XMLHttpRequest.DONE) {
           if (tenant.status === 200) {
               var tenantResult = tenant.responseText;
               var tenantJsonResult = JSON.parse(tenantResult);   
               loggedInTenantData = tenantJsonResult;
//               activeTenant = loggedInTenantData;
               hideLoading();
               var tenantRefId = getTenantRefId();
           	   getAppList(tenantRefId,dataTable);
               getIdpEnum();
           	   autoTokenRefresh();
           }
           else {
               hideLoading();
           }
	       if (dataTable) {
	           dataTable.buttons().enable();
	       }
        }
    };                    
    tenant.send(tenantParams);
}

function getExchangeTypeEnum() {
	// To be implemented after enum
	var obj = [{
		label : $.i18n.prop('producerLabel', lang),
		value : "Producer"
	},{
		label : $.i18n.prop('consumerLabel', lang),
		value : "Consumer"
	}];
	exchangeTypeEnum = obj;
}

function getAppTypeEnum() {
	// To be implemented after enum
	var obj = [{
		label : $.i18n.prop('webLabel', lang),
		value : "Web"
	},{
		label : $.i18n.prop('soapLabel', lang),
		value : "SOAP"
	},{
		label : $.i18n.prop('restLabel', lang),
		value : "REST"
	},{
		label : $.i18n.prop('ftpLabel', lang),
		value : "Ftp"
	},{
		label : $.i18n.prop('streamLabel', lang),
		value : "Stream"
	}];
	appTypeEnum = obj;
}

function getIdpEnum() {
	var obj = [];
	$.each( loggedInTenantData.identityProviders, function( idpKey, idpValue ) {
		obj.push({
			label: idpValue,
			value: idpValue
		});
	});
	idpEnum = obj;
}

function getAppList(tenantId,dataTable) {
	showLoading();
	if (dataTable) {
		dataTable.buttons().disable();
    }
	var xmlhttp = new XMLHttpRequest();
    var params = 'tenantId='+tenantId+'&instanceType=WEB&projection=detail';
    xmlhttp.open("GET", "/api/service/instances/findByTenantIdAndInstanceType?"+params, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE && xmlhttp.status === 200) { 	   
           var result = xmlhttp.responseText;
           var jsonInput = JSON.parse(result);
           if (typeof(jsonInput._embedded) == "undefined") {
        	   hideLoading();
        	   return;
           }
           var serviceInstances = jsonInput._embedded.serviceInstanceList;
           var webApps = [];
           
           $.each( serviceInstances, function( key, value ) {
        	   if (value.instanceType === "Web") {
        		   var callbackUrl = null, instanceName, logo;
      				$.each( value.params, function( paramKey, paramValue ) {
      					if (paramValue.serviceParam.paramName === "Url") {
      						callbackUrl = paramValue.value;
      					}
      					if (paramValue.serviceParam.paramName === "App name") {
      						instanceName = paramValue.value;
      					}
      					if (paramValue.serviceParam.paramName === "Logo") {
      						logo = paramValue.value;
      					}
      				});
  					webApps.push({
      					name : instanceName, // get the instance name from the list of parameters
      					description : value.description, //instanceObj.service.description,
      					callBackUrl : callbackUrl, // get the callBackUrl from the list of parameters
      					logo: "url('"+logo+"')" // get the instance logo from the list of parameters
      				});
      				
      			}
           	});
           	$.each( webApps, function( appKey, appvalue ) {	
           		$( ".app-list-container" ).append( '<div class="app"><div class="app-logo" style="background: #FFF '+appvalue.logo+' no-repeat center center;"></div><div class="app-description"><h1 class="app-title">'+appvalue.name+'</h1>'+appvalue.description+'</div><div class="app-button" data-callBackUrl="'+appvalue.callBackUrl+'" data-poolId="'+loggedInTenantData.userPoolId+'" data-appName="'+portal.name+'">'+$.i18n.prop('launchApp', lang)+'</div></div>' );
           	});
           	if (dataTable) {
        		dataTable.buttons().enable();
        		dataTable.row(':eq(0)').select();
            }
           	hideLoading();
        }
    };            
    xmlhttp.send(params);
}

function autoTokenRefresh() {
	var data = {
     	clientId : loggedInTenantData.clientId,
     	userPoolId : loggedInTenantData.userPoolId,
     	callbackUrl : loggedInTenantData.callbackUrl,
     	domain : loggedInTenantData.domain,
     	signOutUrl : loggedInTenantData.logoutUrl
    }  
	var refreshToken = getCookie(portal.awsRefreshCookieName);
	setInterval(function() {
		amazonRefresh(refreshToken,data);
	},60000*5);
}

export async function checkAuthOnLogin() {
	var queryString = parseQueryString(window.location.href);
	var redirect_to = queryString.redirect_to;	 
	if (redirect_to) {
		window.localStorage.setItem('redirect_to', redirect_to);
	}	
	
	if (isAuthenticated() === true) {
		var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
		window.location.href=full+"/index.html";
	}
	
}

export async function checkAuth() {	
	var queryString = parseQueryString(window.location.href);
	var access_token = queryString.id_token;
	var code = queryString.code;
	
	var redirect_to = window.localStorage.getItem('redirect_to');
	
	var redirectFn = function() {
		if (redirect_to) {
			window.localStorage.removeItem('redirect_to');
			window.location.href = redirect_to;
		}
	}
	
	var successFn = function() {
		$('body').css({
           opacity: 1
        });
		$('.profile-email').html(getLoggedInUserMail());
		setTimeout(function() {
			$('.profile-name').html(loggedInUserData.name);
	        $('.profile-avatar-initials').html(loggedInUserData.firstName.charAt(0)+loggedInUserData.lastName.charAt(0));
		},500);		   
		if (!getCookie("_fpLanguage")) {
			setCookie(portal.awsLanguageCookieName,lang,30); 
		}
        initEnums();
        window.history.pushState({}, document.title, "/index.html");
        redirectFn();
        
	}
	var successFnExternalProvider = function() {
    	var tenantCodeCookieValue = getCookie(portal.awsTenantCodeCookieName);
		$('body').css({
           opacity: 1
        });
        $('.profile-email').html(getLoggedInUserMail());
		setTimeout(function() {
			$('.profile-name').html(loggedInUserData.name);		
			$('.profile-avatar-initials').html(loggedInUserData.firstName.charAt(0)+loggedInUserData.lastName.charAt(0));
		},250);	
        if (!tenantCodeCookieValue) {
        	var token = access_token;
        	if (!access_token) {
        		token = getCookie(portal.awsCookieName);
        	}
        	var tokenObj = parseJwt(token);
    		var tenantCode = tokenObj['custom:client'];
        	setCookie(portal.awsTenantCodeCookieName,tenantCode,30);        	 
        }
        if (!getCookie(portal.awsLanguageCookieName)) {
			setCookie(portal.awsLanguageCookieName,lang,30); 
		}
        initEnums();
        window.history.pushState({}, document.title, "/index.html");
        redirectFn();
	}
    if (isAuthenticated() === true) {
    	successFn();
        hideLoading();
    }
    else {
    	if (access_token) {
    		var tokenHeader = parseJwtAndReturnHeader(access_token);
    		var theTokenObj = parseJwt(access_token);
    		if (tokenHeader) {
    			var tokenVerificationEndpoint = theTokenObj["iss"]+"/.well-known/jwks.json";
    			showLoading();
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", tokenVerificationEndpoint, true);
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                       if (xmlhttp.status === 200) {
                    	   var keys = [];
                           var result = xmlhttp.responseText;
                           var jsonResult = JSON.parse(result);  
                           
                           $.each(jsonResult, function( index, value ) {
                        	   $.each(value, function( objKey, objValue ) {
	                        	   keys.push(objValue.kid);
                        	   });
                           });
                           
                           if (keys.length > 0 && keys.indexOf(tokenHeader.kid) > -1) {                        	   
                        	   // If the signature has been found then the token is valid
                        	   // If the token is valid check if it's still valid
                        	   if (ts <= theTokenObj.exp) {                        		   
	                       			// If the token is not expired then do the magic
                        		   setCookie(portal.awsCookieName,access_token,30);                        		   
                                   successFnExternalProvider();
                                   hideLoading();
	                       	   }
                        	   else {
                        		    eraseCookie(portal.awsCookieName);
	   	                   	        eraseCookie(portal.awsRefreshCookieName);
	   	                   	        eraseCookie(portal.awsTenantCodeCookieName);
	   	                	        eraseCookie("_fpActiveTenant");
	   	                   			window.location.href = "login.html";
                        	   }
                           }    
                           else {
                        	    eraseCookie(portal.awsCookieName);
	                   	        eraseCookie(portal.awsRefreshCookieName);
	                   	        eraseCookie(portal.awsTenantCodeCookieName);
   	                	        eraseCookie("_fpActiveTenant");
	                   			window.location.href = "login.html";
                           }
                           hideLoading();
                       }
                       else {
                           hideLoading();
                       }
                    }
                };                    
                xmlhttp.send();
    		}
    		else {
    			eraseCookie(portal.awsCookieName);
    	        eraseCookie(portal.awsRefreshCookieName);
    	        eraseCookie(portal.awsTenantCodeCookieName);
       	        eraseCookie("_fpActiveTenant");    	        
    			window.location.href = "login.html";
    		}
        	
    	}
    	else {
    		if (code) {
    			var tenantData = localStorage.getItem('loggedIntenantData');
    			var tenantDataInStorage = JSON.parse(tenantData);
    			
    			showLoading();   			
    			var params = 'grant_type=authorization_code&client_id='+tenantDataInStorage.clientId+'&code='+code+"&redirect_uri="+tenantDataInStorage.callbackUrl;
	            var xmlhttp2 = new XMLHttpRequest(); 
	            showLoading(); 
	            xmlhttp2.open("POST", "https://"+tenantDataInStorage.domainUrl+"/oauth2/token", true);
	            xmlhttp2.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	            xmlhttp2.onreadystatechange = function() {
	                if (xmlhttp2.readyState === XMLHttpRequest.DONE) {
	                   if (xmlhttp2.status === 200) {
	                	   var result = xmlhttp2.responseText;
	                       var tokenJsonResult = JSON.parse(result);
	                       var aToken = tokenJsonResult.id_token;
	                       var rToken = tokenJsonResult.refresh_token;
	                       setCookie(portal.awsCookieName,aToken,30);
	                       setCookie(portal.awsRefreshCookieName,rToken,30);
	                       successFnExternalProvider();                                   
                           hideLoading();
	                   }
	                   else {
	                       if (xmlhttp2.status === 409) {
	                           var result2 = xmlhttp.responseText;
	                           var jsonResult = JSON.parse(result2);
	                           showError(jsonResult.message);
	                       }
	                       else {
	                           showError($.i18n.prop('signupError', lang));
	                       }                       
	                       hideLoading();
	               		   window.location.href = "login.html";
	                   }
	                }
	            };                    
	            xmlhttp2.send(params); 
    			
    		}
    		else {
    			 window.location.href = "login.html";
    		}
    	}
        
    }
}

function getActiveTenant() {
	if (getCookie("_fpActiveTenant")) {
		activeTenant = JSON.parse(getCookie("_fpActiveTenant"));
	}
}

function initEnums() {	
	getActiveTenant();
	getTenantStatusEnum();
    getTenantNatureOfBusinessEnum();
    getExchangeTypeEnum();
    getAppTypeEnum();
    getLoggedInUserData();
    getTenantList();
}


async function auth(data,changePass,newPass) { 
	Amplify.configure({
	    Auth: {
	        userPoolId: data.userPoolId,
	        clientId: data.clientId,
	        userPoolWebClientId: data.clientId
	    }
	});
	
	
	var onUserrSignInSuccess = function() {
		// The user directly signs in
        Auth.currentSession().then(data => {
        	var queryString = parseQueryString(window.location.href);
        	var returnTo = queryString.return_to;
            setCookie(portal.awsCookieName,data.getIdToken().getJwtToken(),30);
            setCookie(portal.awsRefreshCookieName,data.getRefreshToken().token,30);            
            if (returnTo) {
            	window.location.href = returnTo;
            }
            else {
            	window.location.href = callbackUrl+"?access_token="+data.getAccessToken().getJwtToken();
            }
            hideLoading();
        })
        .catch(err => {
        	var message = err.message;
            hideLoading();
            if (message) {
                showError(message);
            }
        });
	}
	
	try {
        const user = await Auth.signIn(data.user, data.password);
        // The user has to change it's password
        if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {        	
        	hideLoading();
            if (!changePass) {
                $(".second-step").css({
                   display: "none" 
                });
                $(".third-step").css({
                   display: "block" 
                });                        
                $(".third-step input[name='clientId']").val(sanitize($(".second-step input[name='clientId']").val()));
                $(".third-step input[name='userPoolId']").val(sanitize($(".second-step input[name='userPoolId']").val()));
                $(".third-step input[name='user']").val(sanitize($(".second-step input[name='user']").val()));
                $(".third-step input[name='password']").val(sanitize($(".second-step input[name='password']").val()));
            }
            else {
            	Auth.completeNewPassword(
                    user,
                    newPass
                ).then(user => {
                    // at this time the user is logged in if no MFA required
                	onUserrSignInSuccess();
                }).catch(err => {
                	var message = err.message;
                    hideLoading();
                    if (message) {
                        showError(message);
                    }
                });
            }            
        } else {
            // The user directly signs in
        	onUserrSignInSuccess();
        }
    } catch (err) {
    	var message = err.message;
        hideLoading();
        if (message) {
            showError(message);
        }
    }
}

function resetProfilePasswordForm() {
	var i1 = $("#portal-user-reset-code");
	var i2 = $("#portal-user-reset-password");
	var i3 = $("#portal-user-reset-password-repeat");
	i1.val("");
	i2.val("");
	i3.val("");
}

function initChangePasswordProfile(clientId,userPoolId,user) {
	resetProfilePasswordForm();
	showLoading();
	var poolData = {
        UserPoolId : userPoolId,
        ClientId : clientId
    };                                	
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);                                	
    var userData = {
        Username : user,
        Pool : userPool,
    };                                	
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData); 
    cognitoUser.forgotPassword({
        onSuccess: function () {
        	hideLoading();
            showNotification($.i18n.prop('passwordChanged', lang),"success");
            var container = $(".portal-user-info");
        	var nameUpdateForm = $(".portal-user-update-form");
        	var passwordUpdateForm = $(".portal-user-password-reset-form");
        	passwordUpdateForm.css({
        		display:"none"
        	});
        	nameUpdateForm.css({
        		display:"none"
        	});
        	container.css({
        		display:"block"
        	});
        },
        onFailure: function(err) {
        	hideLoading();
            showNotification(err.message,"error");
        },
        inputVerificationCode: function() {
        	hideLoading();
        	var container = $(".portal-user-info");
        	var nameUpdateForm = $(".portal-user-update-form");
        	var passwordUpdateForm = $(".portal-user-password-reset-form");
        	var ctx = this;
        	container.css({
        		display:"none"
        	});
        	passwordUpdateForm.css({
        		display:"block"
        	});
        	nameUpdateForm.css({
        		display:"none"
        	});
        	
        	var passChangeFn = function() {
        		var p1Val,p2Val,codeVal;      
    	    	var errFn = function() {
    	    		showNotification($.i18n.prop('passwordMatchError', lang),"error");
    	    	}
    	    	var errFieldsFn = function() {
    	    		showNotification($.i18n.prop('fieldsEmptyError', lang),"error");
    	    	}
    	    	$('.portal-user-password-reset-form').find('input').each(function(index,el){
    	    	    if ($(el).attr('id') === "portal-user-reset-code") {
    	    	    	codeVal = sanitize($(el).val());
    	    	    }
    	    	    if ($(el).attr('id') === "portal-user-reset-password") {
    	    	    	p1Val = sanitize($(el).val());
    	    	    }
    	    	    if ($(el).attr('id') === "portal-user-reset-password-repeat") {
    	    	    	p2Val = sanitize($(el).val());
    	    	    }
    	    	});
    	    	if (codeVal && p1Val && p1Val) {
    	    		if (p1Val !== p2Val) {    		
        	    		errFn();
        	    	}
        	    	else {
        	    		if (p1Val && p2Val) {
        	    			var term = p2Val;
        	    			var re = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
        	    			if (re.test(term)) {
        	    				cognitoUser.confirmPassword(codeVal, p2Val, ctx);
        	    			} else {
        	    				showNotification($.i18n.prop('policyNotMet', lang),"error");
        	    			}
        	    			
        	    		}
        	    		
        	    	}
    	    	}
    	    	else {
    	    		errFieldsFn();
    	    	}
    	    	
        	}
        	
        	$(document).on('keypress', '.portal-user-password-reset-form', function(e) {
        		if(e.which === 13) {
        			passChangeFn();
        		}
            });
        	$(document).on('click', '#portal-user-password-submit', function() {
        		passChangeFn();
            });
        }
    });
}

function initChangePassword(clientId,userPoolId,user) {
   
    var poolData = {
        UserPoolId : userPoolId,
        ClientId : clientId
    };                                	
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);                                	
    var userData = {
        Username : user,
        Pool : userPool,
    };                                	
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData); 

	var secondStepForm = $(".second-step");
    var changePasswordForm = $(".change-password-form");
    secondStepForm.css({
        display: "none" 
    });
    changePasswordForm.css({
        display: "block" 
    });
    
    cognitoUser.forgotPassword({
        onSuccess: function () {
            hideLoading();
            $(".success-password-change").css({
            	display: "block"
            });
            $(".change-password-form").css({
            	display: "none"
            });
            $(".change-password-form form").trigger("reset");
        },
        onFailure: function(err) {
            hideLoading();
        	showError(err.message);
        },
        inputVerificationCode: function() {
            hideLoading();
            var ctx = this;
            $(".change-password-trigger").click(function() {
            	validateChangePassword(cognitoUser,ctx);
            });
        }
    });
}

function validateChangePassword(cognitoUser,ctx) {
	var p1 = $("#change_password");
	var p2 = $("#change_repeat_password");
	var code = $("#change_verification_code");
	var p1Val = p1.val();
	var p2Val = p2.val();
	var codeVal = sanitize(code.val());
	if (p1Val !== p2Val) {
		hideError();
		showError($.i18n.prop('passwordMatchError2', lang));
	}
	else {
		if (p2Val) {
			hideError();
			var term = p2Val;
			var re = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
			if (re.test(term)) {
				cognitoUser.confirmPassword(codeVal, p2Val, ctx);
				hideError();
			} else {
				hideError();
				showError($.i18n.prop('policyNotMet', lang));
			}
		}
	}
}

function initForgotPassword() {
	
	showLoading();
	var email = sanitize($('#forgot_pass_email').val());
    var xmlhttp = new XMLHttpRequest();
    var params = 'email='+email;
    xmlhttp.open("GET", "api/users/findByEmail?"+params, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
           if (xmlhttp.status === 200) {
               var result = xmlhttp.responseText;
               var jsonResult = JSON.parse(result);                       
                hideLoading();
                hideError();
                if (jsonResult.tenantId && portal.name) {
                    showLoading();
                    var tenant = new XMLHttpRequest();
                    var tenantParams = 'userPoolId='+jsonResult.userPoolId+"&clientName="+portal.name;
                    tenant.open("GET", "api/identity-provider/getUserPoolClient?"+tenantParams, true);
                    tenant.onreadystatechange = function() {
                        if (tenant.readyState === XMLHttpRequest.DONE) {
                           if (tenant.status === 200) {
                               var tenantResult = tenant.responseText;
                               var tenantJsonResult = JSON.parse(tenantResult);                       
                                hideLoading();
                                hideError();
                                var identityProvider = jsonResult.identityProviderName;                                
                                if (identityProvider === "COGNITO") {
                                	var clientId = tenantJsonResult.clientId;
                                    var userPoolId = tenantJsonResult.userPoolId;
                                    var user = jsonResult.email;
                                    initChangePassword(clientId,userPoolId,user);
                                }
                                
                           }
                           else {
                               hideLoading();
                               showError($.i18n.prop('userNotFound', lang)+"<div class='portal-error-details'>"+$.i18n.prop('userCaseSensitive', lang)+"</div>");
                           }
                        }
                    };                    
                    tenant.send(tenantParams);
                }
           }
           else {
               hideLoading();
               showError($.i18n.prop('userNotFound', lang)+"<div class='portal-error-details'>"+$.i18n.prop('userCaseSensitive', lang)+"</div>");
           }
        }
    };                    
    xmlhttp.send(params);
}

function createPanel(title,body,flex,isMasterDetail,containerClass,tools) {
	var flexProps = "";
	var panel = null;
	var appBody = $(".app-data-container");
	var toolsCollection = [], initTools;
	
	if (tools) {
		$.each( tools, function(toolKey,toolValue) {
			var toolIcon = "";
			if (toolValue === "close") {
				toolIcon = "fa fa-times";
			}
			if (toolValue === "maximize") {
				toolIcon = "fa fa-arrows";
			}
			if (toolValue === "collapse") {
				toolIcon = "fa fa-arrows-v";
			}
			if (toolValue === "refresh") {
				toolIcon = "fa fa-refresh";
			}
			toolsCollection.push('<div class="panel-tool panel-'+toolValue+'"><i class="'+toolIcon+'" aria-hidden="true"></i></div>');			
		});
	}
	
	initTools = toolsCollection.join("");
	
	if (containerClass) {
		appBody = $("."+containerClass);
	}
	var cssClass = null;
	if (isMasterDetail) {
		if (isMasterDetail === "master") {
			cssClass = "portal-master-grid";
		}
		if (isMasterDetail === "detail") {
			cssClass = "portal-detail-grid";			
		}
	}
	if (flex) {
	    appBody.css({
	    	"display" : "flex",
	    	"flex" : 1,
	    	"flex-direction" : "column"
	    });
	    appBody.addClass("master-detail-container");
		flexProps = "display: flex; flex:1; flex-direction: column; height: calc(100vh - 145px)";
		panel = '<div class="portal-panel '+cssClass+'" style="'+flexProps+'"><div class="portal-panel-title">'+title+initTools+'</div><div class="portal-panel-body">'+body+'</div></div>';
	}
	else {
		appBody.css({
	    	"display" : "block",
	    	"flex" : "initial"
	    });
	    appBody.removeClass("master-detail-container");
		panel = '<div class="portal-panel '+cssClass+'"><div class="portal-panel-title">'+title+initTools+'</div><div class="portal-panel-body">'+body+'</div></div>';
	}
	return panel;
}

function createGrid(id, headCols, sourceMap, editorFields, ajaxCfg, extra, rowClickFn, rowDeselectFn) {
	
	var thead = [];
	var fields = [];
	
	for (var i=0;i<editorFields.length;i++) {
		fields.push({
			label: editorFields[i].label,
			name: editorFields[i].name,
			type: editorFields[i].type ? editorFields[i].type : "text",
			options: editorFields[i].options ? editorFields[i].options : null,
			def: editorFields[i].def ? editorFields[i].def : null,
			attr: editorFields[i].attr ? editorFields[i].attr : null,
			_overrideValue_ : typeof(editorFields[i]._overrideValue_) != undefined ? editorFields[i]._overrideValue_ : null,
			_allowEmpty_ : typeof(editorFields[i]._allowEmpty_) != undefined ? editorFields[i]._allowEmpty_ : null
		});		
		
	}
    
    var editor = new $.fn.dataTable.Editor( {
    	
        table: "#"+id,
        fields: fields,
        idSrc:  'id',
        formOptions: {
            main: { 
            	onEsc : function() {
            		return false;
            	}
            }
        },
        i18n: {
            create: {
                title:  $.i18n.prop('createTitle', lang),
                submit: $.i18n.prop('createSubmit', lang)
            },
            edit: {
            	title:  $.i18n.prop('editTitle', lang),
                submit: $.i18n.prop('editSubmit', lang)
            },
            remove: {
            	title:  $.i18n.prop('removeTitle', lang),
                submit: $.i18n.prop('removeSubmit', lang)
            },
            error: {
                system: $.i18n.prop('editErrorMsg', lang)
            }
        },
        ajax: {
        	create: {
                type: 'POST',
                url:  ajaxCfg.saveUrl,
                contentType: "application/json",
            	data: function (d) {
            		return JSON.stringify(d.data[0]);
            	},
            	success: function() {
            		$('#'+id).DataTable().ajax.reload(null,false);
            	}
            },
            edit: {
                type: 'PUT',
                url:  ajaxCfg.editUrl,
                contentType: "application/json",
            	data: function (d) {
            		delete d.action;
            		var idx = 0;
            		var key = Object.keys(d.data)[idx];
            		var value = d.data[key];
            		return JSON.stringify(value);
            	},
            	success: function() {
            		$('#'+id).DataTable().ajax.reload(null,false);
            	}
            },
            remove: {
                type: 'DELETE',
                url:  ajaxCfg.deleteUrl,
                contentType: "application/json",
                data: function (d) {
            		delete d.data;
            	},
            	complete: function() {
            		// To be extended: handle error responses
            		$('#'+id).DataTable().ajax.reload(null,false);
            		$('.DTED_Lightbox_Close').trigger('click');
            	}
            }
            
        }
    } );
    
    // Client-side field validation
    
    editor.on('preOpen', function(e,b,a) {
    	var modifier = editor.modifier();
    	if ( modifier ) {
    		var table = $('#'+id).DataTable();
    	    var data = table.row( modifier ).data(); 
    		selectedParam = data;
    		currentEditorInstance = editor;
    	    if (id === "services-instances-params-table" && a === "edit") {
    	    	var theInput = editor.field("value").input(); 
    	    	
    	    	// Set editor for logo
    	    	
    	    	if (data.serviceParam.paramName === "Logo") { // TO DO: change paramName to type
    	    		theInput.nextAll('div,button').remove();
    	    		theInput.css({
    	    			display:"none"
    	    		}).after("<div class='portal-avatar-preview' style='background:url("+theInput[0].value+") no-repeat'></div><div class='btn' style='width:100%' id='services-instances-avatar-btn'>Select new image</div>");
    	    	}
        	    else {
        	    	theInput.css({
    	    			display:"block"
    	    		}).nextAll('div,button').remove();
        	    }
    	    	
    	    	
    	    	// Set editor for json
    	    	
    	    	if (data.serviceParam.type === "json") {
    	    		theInput.nextAll('button').remove();    	    		
    	    		setTimeout(function() {
    	    			var jsonValue = JSON.parse(sanitize(theInput.val()));
        	    		var pretty = JSON.stringify(jsonValue, undefined, 4);
        	    		theInput.val(pretty); 
        	    		theInput.after("<button class='btn' style='width:100%' id='json-fullscreen-btn'>Enter fullscreen mode</button>");
    	    		},100);
    	    	}
    	    	else {
    	    		theInput.nextAll('button').remove(); 
    	    	}
    	    	
    	    	// Set editor for SSH key upload
    	    	
    	    	if (data.serviceParam.type === "file") {
    	    		theInput.nextAll('div,button').remove();
    	    		theInput.css({
    	    			display:"none"
    	    		}).after("<div class='btn' style='width:100%' id='services-instances-key-btn'>Upload file</div><br><div class='btn' style='width:100%' id='delete-ssh-key'>Delete file</div>");
    	    	}
        	    else {
        	    	theInput.css({
    	    			display:"block"
    	    		}).nextAll('div,button').remove();
        	    }
    	    	
    	    }
    	}
    });
    
    editor.on( 'open', function (json, data, action) {
    	$('.DTED_Lightbox_Background').unbind('click');
    	$('.DTED_Lightbox_Content_Wrapper').unbind('click');
    	$(editor.dom.wrapper).attr('id',id+"-editor");
    	$(editor.dom.header).attr('id',id+"-editor-header");

//    	$('select').selectric();
    	
    	$(".DTE_Form_Buttons").find("button:first-child").addClass("active");
    	
    	if (extra._fieldsVisibility_) {
    		var rules = extra._fieldsVisibility_;
			$.each( rules, function( objKey, objValue ) {
				if (action === objValue.action) {
					$.each( objValue.hideFields, function( fieldKey, fieldValue ) {
						editor.field(fieldValue).dom.container.css("display","none");
					});
					$.each( objValue.hideFieldsIfNotAdmin, function( fieldKeyAdmin, fieldValueAdmin ) {
						if (loggedInUserData.admin !== true && loggedInUserData.root !== true) {
							editor.field(fieldValueAdmin).dom.container.css("display","none");
						}
					});
    				return false; 
				}
				else {
					$.each( objValue.hideFields, function( fieldKey, fieldValue ) {
						editor.field(fieldValue).dom.container.css("display","block");				
					});
				}
			});
			
    	}
    	
    	// Attach custom events to a field
    	
    	if (extra._fieldEvents_ ) {
    		var events = extra._fieldEvents_;
    			$.each( events, function( objEvKey, objEvValue ) {
    				for (var n=0;n<fields.length;n++) {
    		    		if (fields[n].name === objEvValue.field) {
    		    			$.each( objEvValue.eventCfg, function( objEvCfgKey, objEvCfgValue ) {
    		    				editor.field(fields[n].name).input().on(objEvCfgValue.name,function() {
        		    				objEvCfgValue.fn(editor.field(fields[n].name),editor);	    				
        		    			});
    		    			});
    		    			return;
    		    		}
    		    	}
    				
				});
    	}
    	for (var z=0;z<fields.length;z++) {
    		if (fields[z]._overrideValue_ !== undefined) {
    			var tableModifier = editor.modifier();
    			var table = $('#'+id).DataTable();
        	    var tableData = table.row( tableModifier ).data(); 
    			editor.field(fields[z].name).set(fields[z]._overrideValue_(fields[z],tableData));
    		}
    	}
    } );
    
    editor.on( 'preSubmit', function ( e, o, action ) {
		var fields = o.data;
		var allowSubmit = true;
		var ctx = this;
		var newPayload = {};
		
		var abstractFields = injectAbstractFields();
		
    	if ( action !== 'remove' ) {
    		

			
    		
    		$.each( fields, function( key, value ) {
    			
    			
				
    			$.each( value, function( objKey, objValue ) {
    				
    				if (objValue && !isNaN(objValue)) {
    					newPayload[objKey] = parseInt(objValue);
    				}
    				else {
    					newPayload[objKey] = objValue;
    				}    				
    				
    				var found = false;
    				for(var i = 0; i < abstractFields.length; i++) {
    				    if (abstractFields[i].name === objKey) {
    				        found = true;
    				    }
    				}
    			  
				  if (!objValue && found === false && objKey !== "natureOfBusiness") {		
					  var matched = false;
					  for (var z=0;z<editorFields.length;z++) {
    		    		 if (editorFields[z]._allowEmpty_ !== undefined && editorFields[z]._allowEmpty_ === true && editorFields[z].name === objKey) {
    		    			 matched = true;
    		    		 }
	    		      }
					  if (matched === true) {
						  allowSubmit = true;						  
					  }
					  else {
						  allowSubmit = false;	
						  ctx.error(objKey, $.i18n.prop('fieldRequired', lang));							  
					  }
				  }
				  else {
					  if (objKey === "email" && validateEmail(objValue) === false) {
							  allowSubmit = false;
							  ctx.error(objKey, $.i18n.prop('mailNotValid', lang));
					  }
				  }
				  
				});
			});   		
    		
    		
    		o.data[0] = newPayload;
    		$.each( newPayload, function( payloadKey, payloadValue ) {
    			
    			newPayload[payloadKey] = sanitize(payloadValue);
    			
    		});
    		
    		return allowSubmit;
        }
    } );
    
    editor.on( 'submitSuccess', function () {
    	var dt = $('#'+id).DataTable();
    	dt.buttons().disable();
        getLoggedInUserData(dt);
    });
    
    editor.on( 'close', function () {
        selectedParam = null;
        currentEditorInstance = null;
    });
    
    var returnDataFn = function (json) {
	  var jsonRoot = ajaxCfg.jsonRoot;
	  var ignoreEmbed = ajaxCfg.ignoreEmbed;
	  var return_data = ""; 
	  
	  // Store services self link
	  
	  if (json._embedded !== undefined && json._embedded['serviceList'] !== undefined) {
		  var rawServiceUrl = json._links.self.href;
		  var split = rawServiceUrl.split("{");
		  serviceUrl = split[0]+"/";
	  }
	  
	  if (json._embedded !== undefined && json._embedded['linkedHashMapList'] !== undefined && json._embedded['linkedHashMapList'][0].links !== undefined) {
		  if (json._embedded['linkedHashMapList'][0].serviceParam !== undefined) {
			  var linksServiceParamRoot = json._embedded['linkedHashMapList'][0].serviceParam.links;
			  for (var m=0;m<linksServiceParamRoot.length;m++) {
				  if (linksServiceParamRoot[m].rel === "self" ) {
					  var rawServiceInstanceParamUrl = linksServiceParamRoot[m].href;
					  var splitServiceParamUrl = rawServiceInstanceParamUrl.split("{");
					  serviceInstanceParamUrl = splitServiceParamUrl[0]+"/";
				  }
			  }
		  }	
		  if (json._embedded['linkedHashMapList'][0].serviceInstance !== undefined) {
			  var linksServiceInstanceRoot = json._embedded['linkedHashMapList'][0].serviceInstance.links;
			  for (var z=0;z<linksServiceInstanceRoot.length;z++) {
				  if (linksServiceInstanceRoot[z].rel === "self" ) {
					  var rawServiceInstanceUrl = linksServiceInstanceRoot[z].href;
					  var splitinstanceUrl = rawServiceInstanceUrl.split("{");
					  serviceInstanceUrl = splitinstanceUrl[0]+"/";
				  }
			  }
		  }		 
	  }
	  
	  if (json._embedded !== undefined) {
		  return_data = json._embedded[jsonRoot]; 
	  }
	  if (jsonRoot == "") {
		  return_data = json;
	  }
	  else {
		  if (ignoreEmbed && ignoreEmbed === true) {
			  return_data = json[jsonRoot];
		  }
	  }
      return return_data;
	};
	
	var buttonsCfg = function() {
		var buttonsArray = [];
		var newBtn = { extend: "create", editor: editor, attr: { id : id+"-create-button" }, text: $.i18n.prop('newBtn', lang) };
		var editBtn = { extend: "editSingle",   editor: editor, attr: { id : id+"-editSingle-button" }, text: $.i18n.prop('editBtn', lang) };
		var deleteBtn = { extend: "remove",   editor: editor, attr: { id : id+"-remove-button" }, text: $.i18n.prop('deleteBtn', lang) };
		var exportBtn = {
            extend: 'collection',
            text: $.i18n.prop('exportBtn', lang),
            attr: { id : id+"-export-button" },
            buttons: [{
                extend: 'copy',
                attr:  {
                    id: id+"-export-copy-button"
                }
            },{
                extend: 'excel',
                attr:  {
                    id: id+"-export-excel-button"
                }
            },{
                extend: 'csv',
                attr:  {
                    id: id+"-export-csv-button"
                }
            },{
                extend: 'pdf',
                attr:  {
                    id: id+"-export-pdf-button"
                }
            },{
                extend: 'print',
                attr:  {
                    id: id+"-export-print-button"
                }
            }]
        };
		if (extra._showButtons_) {
			for (var y=0;y<extra._showButtons_.length;y++) {
				buttonsArray.push(eval(extra._showButtons_[y]+"Btn"));
			}
			
		}
		else {
			buttonsArray.push(newBtn,editBtn,deleteBtn,exportBtn);
		}
		
		if (extra._customButtons_) {
			for (var z=0;z<extra._customButtons_.length;z++) {
				buttonsArray.push(extra._customButtons_[z]);
			}
			
		}
		
		return buttonsArray;
	}
	
    var tableCfg = {
    	dom: '<"top"Bf<"clear">>r<"custom-dataTables-wrapper"t><"bottom"ip<"clear">>',
//    	dom: '<"top"Bf<"clear">>r<"custom-dataTables-wrapper"t><"bottom"p<"clear">>',
    	responsive: {
	    breakpoints: [
		      {name: 'bigdesktop', width: Infinity},
		      {name: 'meddesktop', width: 1480},
		      {name: 'smalldesktop', width: 1280},
		      {name: 'medium', width: 1188},
		      {name: 'tabletl', width: 1024},
		      {name: 'btwtabllandp', width: 848},
		      {name: 'tabletp', width: 768},
		      {name: 'mobilel', width: 480},
		      {name: 'mobilep', width: 320}
		    ]
		},
    	ajax : {
    		type: 'GET',
    		url: ajaxCfg.dataSourceUrl,
    		dataSrc: function(json) { return returnDataFn(json); },    		 
        	scrollY : ajaxCfg.scrollY ? ajaxCfg.scrollY : null
    	},
    	oLanguage: {
            sSearch: "",
            searchPlaceholder: $.i18n.prop('searchLabel', lang),
            sZeroRecords: $.i18n.prop('zeroRecords', lang),            
            oPaginate: {
            	sNext :$.i18n.prop('sNext', lang),
                sPrevious : $.i18n.prop('sPrevious', lang)
            }
            
        },
		columns: sourceMap,
		select: {
            style:    'single', //'multi',
            selector: 'td'
        },
        buttons: buttonsCfg(),
        pageLength: 30
    }
    if (extra) {
    	$.extend(tableCfg, extra);
    }
	for (var z=0;z<headCols.length;z++) {
		thead.push("<th>"+headCols[z]+"</th>");
	}
	var body = '<table id="'+id+'" class="display" cellspacing="0" width="100%">'+
    '<thead>'+
            '<tr>'+thead.join("")+'</tr>'+
    '</thead>'+
    '</table>';
	
	setTimeout(function() {
		
		$.fn.dataTable.ext.errMode = 'none';
		
		$('#'+id).DataTable(tableCfg).button( 0 ).active(true);
	    
	    // Append the selected record ID to the remove and edit urls
		
		$(".dataTables_filter input").attr("placeholder", $.i18n.prop('searchLabel', lang));	
	    
		$('#'+id).DataTable().on( 'select', function ( e, dt, type, indexes ) {
	        var rowData = dt.rows( indexes ).data().toArray();
	        var row = dt.row(indexes).node();
	        var selectedRowId = rowData[0].id;
	        var editorAjaxCfg = dt.editor().s.ajax;	        
	        $(row).closest('table').find('tr').not(row).removeClass('selected');	        
	        editorAjaxCfg.remove.url = ajaxCfg.deleteUrl + "/" +selectedRowId;
	        editorAjaxCfg.edit.url = ajaxCfg.editUrl + "/" +selectedRowId;	  
	        if (rowClickFn) {
				rowClickFn(dt,rowData,row);
			}	
	        var isRoot = loggedInUserData.root;
	        var isAdmin = loggedInUserData.admin;
			if (!isRoot && !isAdmin && id === "users-table") {
				$('#'+id).DataTable().buttons().disable();
			}
	    });
		
		$('#'+id).DataTable().on( 'deselect', function ( e, dt, type, indexes ) {
	        var rowData = dt.rows( indexes ).data().toArray();
	        var row = dt.rows( indexes );
	        var selectedRowId = rowData[0].id;
	        var editorAjaxCfg = dt.editor().s.ajax;
	        
	        editorAjaxCfg.remove.url = ajaxCfg.deleteUrl + "/" +selectedRowId;
	        editorAjaxCfg.edit.url = ajaxCfg.editUrl + "/" +selectedRowId;	        
	        if (rowDeselectFn) {
	        	rowDeselectFn(dt,rowData,row);
			}	 
	    });
		
		$('#'+id).DataTable().on( 'preDraw', function () {
			$("#"+id+"_filter").find("input").attr("id",id+"_filter_input");
			var isRoot = loggedInUserData.root;
			var isAdmin = loggedInUserData.admin;
			if (!isRoot && !isAdmin && id === "users-table") {
				$('#'+id).DataTable().buttons().disable();
			}
	    });
		
		$('#'+id).DataTable().on( 'draw', function () {
//			$(".custom-dataTables-wrapper").niceScroll();
			window.dispatchEvent(new Event('resize')); // Dirty hack to initialize the nicescroll plugin in child tables
			setTimeout(function() {
				if (id === "services-table" && !$('#'+id).DataTable().rows( '.selected' ).any()) {
					$('#services-instances-table').DataTable().buttons().disable();
				}
			},300);
			
	    });
		
		$('#'+id).DataTable().on('user-select', function (e, dt, type, cell) {
			// Disable deslect on button cell
		    if ($(cell.node()).hasClass('unbind-select')) {
		        e.preventDefault();
		    }
		});
	}, 10);
	return body;
}

function initdashboard() {

    var appBody = $(".app-data-container");
    var Resource = {
        load: function(src, callback, type, id) {
            var style = "display:none";
            if (!type) {
                type="script";
            }
            var res = document.createElement(type),loaded;
            res.setAttribute('src', src);   
            res.setAttribute('id', id); 
            if (type === "img") {
                res.setAttribute('style', style);
                $('body').prepend(res).ready(function (response) {
                    if (!loaded) {
                        callback();
                    }
                    loaded = true;
                });
            }
            else {
                res.onreadystatechange = res.onload = function(a,b,c,d) {
                    if (!loaded) {
                        callback();
                    }
                    loaded = true; 
                };
                document.getElementsByTagName('body')[0].prepend(res);
            }
        }
    }; 
	var full = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
	var dashboardCfg = {
	    // Connection data
	    sisenseEndpoint : full+"/sso/sisense?return_to=/",
	    analyticsEndpoint: "https://analytics.fuelplus.com",
	    // Dashboard data
	    dashboardId: '5c5304038b8a241e90e2b69b',
	    widgetMap: [{
	        widgetId : "5c5315a9f7f346163804605b",
	        containerId: "pie"
	    },{
	        widgetId : "5c531827f7f3461638046060",
	        containerId: "bar1"
	    },{
	        widgetId : "5c540dd1f7f3461638046069",
	        containerId: "bar2"
	    }],
	    filetrContainerId : "filter"
	}
	
	var loadFn = function() {
		var iframe = document.createElement('iframe');
		iframe.style="border:0px; width:100%; height:100%";
		iframe.src = dashboardCfg.analyticsEndpoint+'/app/main#/dashboards/'+dashboardCfg.dashboardId+'?embed=true';
		appBody.html(iframe);
	}
	
	if($("#sisenseEndpoint").length){
    	loadFn();
    }
    else {
    	Resource.load(dashboardCfg.sisenseEndpoint, function() {
    		loadFn();
        },null,"sisenseEndpoint");
    }
	
}

function showAnalytics() {
	var dashboard = $(".app-dashboard");
    var appBody = $(".app-data-container");
    dashboard.hide();   
    appBody.empty();
    initdashboard();
}

function createSimplePanel(theTitle, body, id, tools) {
	var dashboard = $(".app-dashboard");
    var appBody = $(".app-data-container");
	var title = theTitle;
    dashboard.hide();   
    appBody.empty();
    appBody.html(createPanel(title,body,id, null, null, tools));
}

function createMasterDetailPanel(masterTitle,masterBody,detailTitle,detailBody,masterTools,detailTools) {
	var dashboard = $(".app-dashboard");
    var appBody = $(".app-data-container");
    dashboard.hide();   
    appBody.empty();
    appBody.html(createPanel(masterTitle,masterBody,true,"master",null,masterTools)+createPanel(detailTitle,detailBody,true,"detail",null,detailTools));   
}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

function buildTenantsTable() {
	var tableHeadColumns = ["",$.i18n.prop('code', lang),$.i18n.prop('email', lang),$.i18n.prop('alias', lang),$.i18n.prop('name', lang),$.i18n.prop('ownerName', lang),$.i18n.prop('poolId', lang),$.i18n.prop('natureOfBusiness', lang),$.i18n.prop('status', lang),$.i18n.prop('createdBy', lang),$.i18n.prop('createdAt', lang)];
    var editorFields = [ {
            label: $.i18n.prop('codeLabel', lang),
            name: "code"
        }, {
            label: $.i18n.prop('mailLabel', lang),
            name: "email"
        }, {
            label: $.i18n.prop('aliasLabel', lang),
            name: "alias"
        },{
            label: $.i18n.prop('nameTableLabel', lang),
            name: "name"
        }, {
            label: $.i18n.prop('ownerNameLabel', lang),
            name: "ownerName"
        }, {
            label: $.i18n.prop('poolIdLabel', lang),
            name: "userPoolId"
        }, {
            label: $.i18n.prop('nobLabel', lang),
            name: "natureOfBusiness",
            type:  "select",
            options: tenantNatureOfBusinessEnum
        }, {
            label: $.i18n.prop('statusLabel', lang),
            name: "tenantStatus",
            type:  "select",
            options: tenantStatusEnum
        }
    ].concat(injectAbstractFields());
    var tenantColumns = [
 	  {
            data: null,
            defaultContent: '',
            className: 'select-checkbox',
            orderable: false
       },
            {data: "code"},
            {data: "email"},
            {data: "alias"},
            {data: "name"},
            {data: "ownerName"},
            {data: "userPoolId"},
            {data: "natureOfBusiness"},
            {data: "tenantStatus"},
            {data: "createdBy"},
            {
         	   data: "createdAt",
         	   render: function(data){
         		   var date = new Date(data);
         		   return date.toUTCString();
         	   }
            }
        ];

    var ajaxCfg = {
 		   saveUrl: "/api/tenants/saveTenant",
 		   editUrl: "/api/tenants/editTenant",
 		   deleteUrl: "/api/tenants/deleteTenant",
 		   dataSourceUrl: "/api/tenants/findAll?page=0&size=1000&projection=detail",
 		   jsonRoot: "tenantList"
    };
    var extra = {
 	order: [[ 8, "desc" ]],
    }
    var panelBody = createGrid("tenants-table",tableHeadColumns,tenantColumns,editorFields,ajaxCfg,extra);
    return panelBody;
}

function showTenants() {
    createSimplePanel($.i18n.prop('manageTenants', lang),buildTenantsTable(),"master");
}

function showUsers() {
	var tools = ["refresh"]; // Available tools: close,maximize,collapse 
    createSimplePanel($.i18n.prop('manageUsersTitle', lang),buildUsersTable(),"master",tools);
}

function buildServicesTable(rowClickFn, rowDeselectFn) {
	var tableHeadColumns = ["",$.i18n.prop('code', lang),$.i18n.prop('name', lang),$.i18n.prop('active', lang),$.i18n.prop('type', lang),$.i18n.prop('createdBy', lang),$.i18n.prop('createdAt', lang)];
    var editorFields = [ {
            label: $.i18n.prop('codeLabel', lang),
            name: "code"
        }, {
            label: $.i18n.prop('nameTableLabel', lang),
            name: "name"
        }, {
            label: $.i18n.prop('activeLabel', lang),
            name: "active",
            type:  "select",
            options: [{
            	label : $.i18n.prop('yesLabel', lang),
            	value : "true"
            },{
            	label : $.i18n.prop('noLabel', lang),
            	value : "false"
            }]
        }, {
        	label: $.i18n.prop('typeLabel', lang),
            name: "type",
            def: "FuelPlus Transaction"
        }
        
    ].concat(injectAbstractFields());
    var columns = [
 	  {
            data: null,
            defaultContent: '',
            className: 'select-checkbox',
            orderable: false
       },
       		{data: "code"},
            {data: "name"},
            {
            	data: "active",
         	    render: function(data) {
         		   if (data === true) {
         			   return "Yes";
         		   }
         		   else {
         			   return "No";
         		   }
         	    }
            	
            },{data: "type"},
              {data: "createdBy"},
            {
         	   data: "createdAt",
         	   render: function(data){
         		   var date = new Date(data);
         		   return date.toUTCString();
         	   }
            }
        ];
    
    var tenantId = loggedInUserData.tenantId;
    if (activeTenant.refid) {
    	tenantId = activeTenant.refid;
    }
    var ajaxCfg = {
 		   saveUrl: "/api/services/saveService",
 		   editUrl: "/api/services/editService",
 		   deleteUrl: "/api/services/deleteService",
 		   dataSourceUrl: "/api/services/findAll?page=0&size=1000&projection=self",
 		   jsonRoot: "serviceList"
    };
    var extra = {
 	order: [[ 5, "desc" ]],
    }
    var panelBody = createGrid("services-table",tableHeadColumns,columns,editorFields,ajaxCfg,extra,rowClickFn,rowDeselectFn);
    return panelBody;
}

function showServices() {
	showLoading();	
    createSimplePanel($.i18n.prop('manageServicesTitle', lang),buildServicesTable());
}

function createRangeFields() {
	var html = ['<div class="DTE_Field DTE_Field_Type_text">',
	    '<label class="DTE_Label">Report starting date</label>',
	    '<div class="DTE_Field_Input">',
	        '<div class="DTE_Field_InputControl" style="display: block;">',
	            '<input id="DTE_Field_code" class="wdw-field-date audit-start-date" type="text">',
	        '</div>',
	    '</div>',
	'</div>',
	'<div class="DTE_Field DTE_Field_Type_text" style="margin-top:20px">',
	    '<label class="DTE_Label">Report ending date</label>',
	    '<div class="DTE_Field_Input">',
	        '<div class="DTE_Field_InputControl" style="display: block;">',
	            '<input id="DTE_Field_code" class="wdw-field-date audit-end-date" type="text">',
	        '</div>',
	    '</div>',
	'</div>'
	].join("");
	
	setTimeout(function() {
        $('.wdw-field-date').datetimepicker({
        	timepicker:false,
            format: 'Y-m-d',
            formatTime: 'H:i',
            formatDate: 'Y-m-d',
            closeOnDateSelect: true
        });
    },150);
	
	return html;
}


function buildAuditTable(rowClickFn, rowDeselectFn) {
	var tableHeadColumns = ["",$.i18n.prop('authTime', lang),$.i18n.prop('auditName', lang),$.i18n.prop('auditUserName', lang)];
    var editorFields = [ {
            label: $.i18n.prop('authTime', lang),
            name: "timestamp"
        }, {
            label: $.i18n.prop('auditName', lang),
            name: "name"
        }, {
            label: $.i18n.prop('auditTenantId', lang),
            name: "tenantId"
        }, {
            label: $.i18n.prop('auditUserName', lang),
            name: "username"
        }        
    ];
    var columns = [
 	  {
            data: null,
            defaultContent: '',
            className: 'select-checkbox',
            orderable: false
       },
            {data: "timestamp"},
            {data: "name"},
            {data: "username"}
        ];
    
    var tenantId = loggedInUserData.tenantId;
    if (activeTenant.refid) {
    	tenantId = activeTenant.refid;
    }
    var ajaxCfg = {
 		   dataSourceUrl: "/api/users/audit?page=0&size=1000&projection=self&tenantId="+tenantId,
 		   jsonRoot: "content",
 		   ignoreEmbed: true
    }
    
    var extra = {
 	order: [[ 1, "desc" ]],
 	
 	// Audit table specific config
 	
// 	pagingType: "simple",
 	paging: false,
    "bInfo" : false,
//    preDrawCallback: function() {
//    	console.log(resetAuditTable);
//	    var dataTable = $("#audit-table").DataTable();
//        var jsonData = dataTable.ajax.json();
//        console.log(jsonData);
//        if (resetAuditTable) {
//        	dataTable.ajax.reload();
////        	dataTable.ajax.reload(null,false);
////            $("#"+tableId).DataTable().draw();
//    	} 
//    },
    drawCallback: function(d,json){
    	auditStopFlag = false;
	    var dataTable = $("#audit-table").DataTable();
        var jsonData = dataTable.ajax.json();
        var nextPageToken = jsonData && jsonData.nextPageToken ? jsonData.nextPageToken : null, responseToken = null;
       
            $('div.custom-dataTables-wrapper').scroll(function () {
    			var childTable = $(this).find("#audit-table");
    			if (childTable.length > 0) {
    	    		if(Math.round($(this).scrollTop() + $(this).outerHeight()) === $(this)[0].scrollHeight) {
    	    			
    	    			if (auditHasMore && !auditStopFlag && (nextPageToken !== responseToken) && auditSearchActive === false) {
    	    				
    	    				$.ajax({
    	    		            type: "GET",
    	    		            async: false,
    	    		            url: ajaxCfg.dataSourceUrl+"&nextPageToken="+nextPageToken,
    	    		            contentType: "application/json",
    	    		            dataType: "json",
    	    		            success: function (response) {
    	    		                var jsonObject = response.content;
    	    		                dataTable.rows.add(jsonObject).draw(false);
    	    		                dataTable.draw();
    	    		                responseToken = response && response.nextPageToken ? response.nextPageToken : null;
    	    		                nextPageToken = response && response.nextPageToken ? response.nextPageToken : null;
    	    		                console.log(response);
    	    		                if (!nextPageToken) {
    	    		                	auditStopFlag = true;
    	    		                	auditHasMore = false;
    	    		                }
    	    		                else {
    	    		                	auditHasMore = true;
    	    		                }
    	    		                
    	    		            },
    	    		            failure: function (response) {
    	    		            	showNotification(response.message,"error");
    	    		            }
    	    		        });
    	    				
    	    			}
    		        }        	        
    	    	}  
    		});
            
            dataTable.on( 'search.dt', function () {
                var searchVal = dataTable.search();
                if (searchVal != "") {
             	   auditSearchActive = true;
                }
                else {
             	   auditSearchActive = false;
                }
             } );
            
            
     },
 	_showButtons_ : ["export"],
 	_customButtons_ : [
        {
            text: 'Generate audit report',
            attr:  {
                id: 'generate-audit-button'
            },
            action: function ( e, dt, w) {
            	createWindow("", "generate-audit-report-wdw",[{
                    label: "Generate",
                    cls: "active",
                    action: function() {
                    	var auditStartDate = $(".audit-start-date").val();
                    	var auditEndDate = $(".audit-end-date").val();
                    	var tenantId = loggedInUserData.tenantId;
                        if (activeTenant.refid) {
                        	tenantId = activeTenant.refid;
                        }
                    	if (auditStartDate) {

                            showLoading();
                    		var request = new XMLHttpRequest();
                            request.onreadystatechange = function() {
                                if(request.readyState == 4) {
                                    if(request.status == 200) {                                    	
                                        var a = document.createElement('a');                            
                                        var url = window.URL.createObjectURL(request.response);
                                        a.href = url;
                                        a.download = "AuthentificationAudit.xlsx";
                                        document.body.append(a);
                                        a.click();
                                        a.remove();
                                        window.URL.revokeObjectURL(url);  
                                        hideLoading();  
                                    	$(".generate-audit-report-wdw").find(".close-window").trigger("click");                            
                                    } else if(request.responseText != "") {
                                        var parsedJson = JSON.parse(request.responseText);
                                        if (parsedJson.message) {
                                            hideLoading();
                                            showNotification(parsedJson.message, "error");
                                        }
                                    }
                                } else if (request.readyState == 2) {
                                    if(request.status == 200) {
                                        request.responseType = "blob";
                                    } else {
                                        request.responseType = "text";
                                    }
                                }
                            };
                            request.open("GET","/api/users/audit/export?tenantId="+tenantId+"&startDate="+auditStartDate+"&endDate="+auditEndDate, true);
                            request.send();
                    	}
                    	else {
                    		showNotification($.i18n.prop('dateRangeMandatory', lang),"info");
                    	}
                    }
                },{
                    label: "Cancel",
                    cls: "close-window"
                }],"<div>"+createRangeFields()+"</div>",300,null,{
                    dataTable: dt,
                    positioningEl: $("#generate-audit-button")
                });
            }
        }]
    }
    var panelBody = createGrid("audit-table",tableHeadColumns,columns,editorFields,ajaxCfg,extra,rowClickFn,rowDeselectFn);
    return panelBody;
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

//Shwows a windows that already exists in the DOM

function showWindow(w,callbackFn,callBackParams) {
    if (callBackParams && typeof(callBackParams.positioningEl) !== undefined) {
        var el = callBackParams.positioningEl;        
        var scrollTop = $(window).scrollTop();
        var elementOffset = el.offset().top;
        var t = (elementOffset + scrollTop);        
        w.css({
            marginLeft: el.offset().left,
            top: t+el.outerHeight()+10,
            transform: "translateY(0px)"
        });
    }
    
    w.addClass("window-visible");
    if (callbackFn) {
        callbackFn(callBackParams);
    }
}

//Adds a window to the DOM and shows it

function createWindow(title,cls,btnCfg,body,width,callBack,callBackParams) {

    var winId = uuidv4();
    var btnPayload = [];
    var wdwBody = [];
    var wdwBodyList = [];
    var winWidth = 560;
    var winCols = 1;
    var winCls = "";
    
    if (cls) {
    	winCls = " "+cls; 
    }
    
    console.log(winCls);

    if (width) {
        winWidth = width;
    }

    if (btnCfg) {
        $.each( btnCfg, function( index, val ) {
            var theBtnId = uuidv4();
            btnPayload.push('<button id="'+theBtnId+'" class="dt-button window-button '+val.cls+'">'+val.label+'</button>'); 
            if (val.action) {
                setTimeout(function() {
                    $("#"+theBtnId).bind( "click", function() {
                        val.action($("#"+theBtnId),val.actionParameters);
                        theBtnId = null;
                    });
                },300);
            }    
        });
    }

    if (body) {
        for (var n = 0; n < body.length; n++) {
            if (typeof(body[n]) === "object") {
                var cols = body[n].cols;
                for (var i = 0; i<cols; i++) {
                    var colNum = i + 1;
                    var contentType = body[n].colContent[i].type;
                    var content = "";
                    var colCls = body[n].colContent[i].cls ? body[n].colContent[i].cls : "";
                    if (body[n].colContent[i].cls && body[n].colContent[i].cls !== "col-extra") {
                        winCols++;
                    }

                    if (contentType === "text") {
                        content = body[n].colContent[i].content;
                    }
                    if (contentType === "list") {
                        var listHtml = [];
                        list = body[n].colContent[i].items;
                        for (var z = 0; z<list.length; z++) {
                            listHtml.push("<div class='app-body-row'>"+list[z].content+"</div>");
                        }
                        content = listHtml.join("");
                    }
                    wdwBodyList.push('<div class="app-wdw-col wdw-col-'+colNum+' '+colCls+'">'+content+'</div>');
                }
            }
            if (typeof(body[n]) === "string") {
                wdwBody.push(body[n]);
            }
        }
        
    }
    var titleContainer = ['<div class="app-window-header display-table">', 
    '<div class="display-table-cell vertical-middle align-left">',
    '<div class="portal-panel-title">',
    title,
    '</div>',
    '</div>',
    '<div class="display-table-cell vertical-middle align-right">',
    '<i class="fas fa-times close-window"></i>',
    '</div>',
    '</div>'].join("");
    var passTop = "0px";
    
    if (title=="") {
    	titleContainer = "";
    	passTop = "padding-top: 20px";
    }
    
    var theWindow = ['<div class="app-window app-dynamic-window '+winCls+'" data-window-width='+winWidth+' style="width:'+winWidth*winCols+'px" id="'+winId+'">', 
    	titleContainer,
    '<div class="app-window-body display-table">',
    '<div class="display-table-cell vertical-middle window-body" style="'+passTop+'">',
    wdwBody.join(""),
    '<div class="window-body-wrapper">',
    wdwBodyList.join(""),
    '</div>',
    '</div>',
    '</div>',
    '<div class="app-window-footer display-table">',
    '<div class="display-table-cell vertical-middle align-left" style="padding-top:5px; padding-bottom:10px; padding-left:20px;">',
    btnPayload.join(""),
    ' </div>',
    '</div>',
    '</div>'];
    $("body").append(theWindow.join(""));
    showWindow($("#"+winId),null,callBackParams);

    
    if (callBack) {
        callBack(winId);
    }
    
    // $('select').select2();
}

function showAudit() {
//	var tools = ["refresh"]; // Available tools: close,maximize,collapse 
    createSimplePanel($.i18n.prop('auditTitle', lang),buildAuditTable(),"master");
    auditHasMore = true;
}

function showHideSidebarPanel(callBackFn) {
	var sidebarPanel = $(".app-data-details");
	if (!sidebarPanel.hasClass("panel-visible")) {
		sidebarPanel.addClass("panel-visible");
	}
	if (callBackFn) {
		callBackFn(sidebarPanel,"app-data-details");
	}
	
}

function editParameters(button,tableId) {
	var table = $("#"+tableId).DataTable();
	var data = table.row($(button).parents('tr')).data();
	var id = data.id;
	var tools = ["close","maximize"]; // Available tools: close,maximize,collapse
	table.rows().deselect();
	$(button).parents('tr').addClass("selected");
	selectedServiceInstance = data;
	var callBackFn = function(container,containerClass) {
		container.html(createPanel($.i18n.prop('instanceParametersTitle', lang),buildServiceInstanceParamsTable(id),true,null,containerClass,tools));
	}
	showHideSidebarPanel(callBackFn);
	
}

function buildServiceInstancesTable(rowSelectFn,rowDeselectFn) {
	var tableHeadColumns = ["",$.i18n.prop('serviceId', lang),$.i18n.prop('tenantId', lang),$.i18n.prop('instanceType', lang),$.i18n.prop('exchangeType', lang),$.i18n.prop('description', lang), $.i18n.prop('environmentLabel', lang),$.i18n.prop('createdBy', lang),$.i18n.prop('createdAt', lang), $.i18n.prop('parameters', lang)];
    var editorFields = [ {
            label: $.i18n.prop('instanceTypeLabel', lang),
            name: "instanceType",
            type: "select",
            options: appTypeEnum
        },{
            label: $.i18n.prop('exchangeTypeLabel', lang),
            name: "exchangeType",
            type:  "select",
            options: exchangeTypeEnum
        }, {
            label: $.i18n.prop('descriptionLabel', lang),
            name: "description",
            type: "textarea"
        }, {
     	    label: $.i18n.prop('tenantIdLabel', lang),
     	    name: "tenantId",
     	    type:  "hidden",
     	    def: function() {
     	    	return getTenantRefId();
     	    }
        }, {
     	    label: $.i18n.prop('serviceLabel', lang),
     	    name: "service",
     	    type:  "hidden",
     	    def: function() {
     	    	return serviceUrl+selectedServiceId;
     	    },
     	    
     	    // Override the value from the record
     	    
     	    _overrideValue_ : function() {
     	    	return serviceUrl+selectedServiceId;
     	    }
        }, {
     	    label: $.i18n.prop('environmentLabel', lang),
     	    name: "environment"
        }
    ].concat(injectAbstractFields());
       
    var columns = [
 	  {
            data: null,
            defaultContent: '',
            className: 'select-checkbox',
            orderable: false
       },
       {
           data: "service",
           visible: false,
    	   render: function() {
    		   return serviceUrl+selectedServiceId
      	    }
       },
       {
           data: "tenantId",
           visible: false
       },
       {
	    	data: "instanceType", 
	    	width: 170,
     	    render: function(data) {
     		   if (data === "Web") {
     			   return "Web";
     		   }
     		   else {
     			  return data;
     		   }
     	    }
    	}, {data: "exchangeType"},
    	   {data: "description"},
    	   {data: "environment"},
    	   {data: "createdBy"},
    	   {
         	   data: "createdAt",
         	   width: 180,
         	   render: function(data){
         		   var date = new Date(data);
         		   return date.toUTCString();
         	   }
    	   },
    	   {
    		   data: null,
    		   className: "button-cell unbind-select",
    		   defaultContent: "<button class='dt-button' onclick='editParameters(this,\"services-instances-table\")'>"+$.i18n.prop('editParamsButton', lang)+"</button>"
    	   }
        ];
    
    
    var tenantId = loggedInUserData.tenantId;
    if (activeTenant.refid) {
    	tenantId = activeTenant.refid;
    }
    var ajaxCfg = {
 		   saveUrl: "/api/service/instances/saveServiceInstance",
 		   editUrl: "/api/service/instances/editServiceInstance",
 		   deleteUrl: "/api/service/instances/deleteServiceInstance",
 		   dataSourceUrl: "/api/service/instances/findByServiceCodeAndTenantId?tenantId="+tenantId +"&page=0&size=0&projection=detail",
 		   jsonRoot: "linkedHashMapList"
    };
    var extra = {
	 	order: [[ 3, "desc" ]],
		serverSide : true,
		deferLoading : 1,
		paging: false
    }
    var panelBody = createGrid("services-instances-table",tableHeadColumns,columns,editorFields,ajaxCfg,extra,rowSelectFn,rowDeselectFn);
    return panelBody;
}

function buildServiceInstanceParamsTable(id,paramsRowClickFn) {
	var tableHeadColumns = ["",$.i18n.prop('name', lang), $.i18n.prop('value', lang)];
    var editorFields = [ {
            label: $.i18n.prop('paramName', lang),
            name: "serviceParam.paramName",
            type: "text"
        },{
            label: $.i18n.prop('valueLabel', lang),
            name: "value",
            type:  "textarea",
            _allowEmpty_ : true
        },{
            label: $.i18n.prop('tenantIdLabel', lang),
            name: "tenantId",
            type:  "hidden",
     	    def: getTenantRefId()
        }, {
     	    label: $.i18n.prop('tenantIdLabel', lang),
     	    name: "serviceInstance",
     	    type:  "hidden",
     	    def: function() {
     	    	return serviceInstanceUrl;
     	    },
     	    _overrideValue_ : function() {
     	    	return serviceInstanceUrl;
     	    }
        }, {
     	    label: $.i18n.prop('serviceParamLabel', lang),
     	    name: "serviceParam",
     	    type:  "hidden",
     	    def: function() {
     	    	return serviceInstanceParamUrl;
     	    },
     	    _overrideValue_ : function() {
     	    	return serviceInstanceParamUrl;
     	    }
        }
//        , {
//            name: "avatarImage",
//            type: "text",
//            label: "Update avatar image"
//        }
        
    ].concat(injectAbstractFields());
       
    var columns = [
 	  {
            data: null,
            defaultContent: '',
            className: 'select-checkbox',
            orderable: false
       },
       {
           data: "serviceParam.paramName",
           width: "100px"
       },
       {
           data: "value",
     	   render: function(data){
     		   
     		  // If the value is a base64 encoded image
     		   
     		  if(data && data.indexOf("data:image") >= 0) {
     			  var img = "<img src='"+data+"' style='width:auto; height:30px'>";
     			  return img;
     		  }
     		   
     		  if (data && data.length > 180) {
 			    var short = data.substring(0, 180) + " ...";
 			    return short;
 			  }
     		  else {
     			  return data;
     		  }
     	   }
       }];
    
    
    var ajaxCfg = {
 		   saveUrl: "/api/service/instances/saveServiceInstanceParam",
 		   editUrl: "/api/service/instances/editServiceInstanceParam",
 		   deleteUrl: "/api/service/instances/deleteServiceInstanceParam",
 		   dataSourceUrl: "/api/service/instances/findParamsByServiceInstanceId?serviceInstanceId="+id+"&projection=detail",
 		   jsonRoot: "linkedHashMapList"
    };
    var extra = {
	 	order: [[ 1, "desc" ]],
	 	
	 	// Control which buttons you want to show on the grid panel
	 	
		_showButtons_ : ["edit","export"]
//		serverSide : true,
//		deferLoading : 1,
//		paging: false
    }
    var panelBody = createGrid("services-instances-params-table",tableHeadColumns,columns,editorFields,ajaxCfg,extra,paramsRowClickFn);
    return panelBody;
}

function showServiceInstances() {
	showLoading();
	createSimplePanel($.i18n.prop('manageServiceInstancesTitle', lang),buildServiceInstancesTable());
}

function injectAbstractFields() {
   var fields =  [{
	    label: $.i18n.prop('idLabel', lang),
	    name: "id",
	    type:  "hidden",
	    abstract: true
   }, {
   	    label: $.i18n.prop('createdBy', lang),
	    name: "createdBy",
	    type:  "hidden",
	    abstract: true,
	    def: getLoggedInUserName()
   }, {
   	    label: $.i18n.prop('createdAt', lang),
	    name: "createdAt",
	    type:  "hidden",
	    abstract: true
   }, {
   	    label: $.i18n.prop('refidLabel', lang),
	    name: "refid",
	    type:  "hidden",
	    abstract: true
   }, {
   	    label: $.i18n.prop('modifiedBy', lang),
	    name: "modifiedBy",
	    type:  "hidden",
	    abstract: true,
	    def: getLoggedInUserName()
   }, {
   	    label: $.i18n.prop('modifiedAt', lang),
	    name: "modifiedAt",
	    type:  "hidden",
	    abstract: true
   }, {
   	    label: $.i18n.prop('version', lang),
	    name: "version",
	    type:  "hidden",
	    def: 1
   }];
   return fields;
   
}

function buildUsersTable() {
	var tableHeadColumns = ["",$.i18n.prop('firstName', lang),"",$.i18n.prop('lastName', lang),$.i18n.prop('email', lang),$.i18n.prop('enabledCol', lang),$.i18n.prop('statusCol', lang),$.i18n.prop('adminCol', lang),$.i18n.prop('identityProvider', lang),$.i18n.prop('createdAt', lang)];
    var editorFields = [ {
	        label: $.i18n.prop('mailLabel', lang),
	        name: "email"
	    },{
	    	label: "Photo",
	    	name: "photo",
	    	type: "hidden",
	    	def: " ",
	    	
     	    
     	    // Override the value from the record
     	    
     	    _overrideValue_ : function(field,data) {
     	    	var fieldName = field.name;
     	    	var photoVal = " ";
     	    	if (data && data[fieldName]) {
     	    		photoVal = data[fieldName];
     	    	}
     	    	return photoVal;
     	    }
	    },{
            label: $.i18n.prop('userLabel', lang),
            name: "username",
//            type: "readonly"
        },{
            label: $.i18n.prop('firstNameLabel', lang),
            name: "firstName"
        },{
            label: $.i18n.prop('nameLabel2', lang),
            name: "name",
            type: "readonly"
        },{
            label: $.i18n.prop('lastNameLabel', lang),
            name: "lastName"
        }, {
            label: $.i18n.prop('poolIdLabel', lang),
            name: "userPoolId",
            type: "readonly",
            def: activeTenant.userPoolId ? activeTenant.userPoolId : loggedInTenantData.userPoolId
        }, {
            label: $.i18n.prop('identityProvider', lang),
            name: "identityProviderName",
            type: "select",
            attr: {
                required: false
            },
            options: idpEnum
        }, {
     	    label: $.i18n.prop('tenantLabel', lang),
     	    name: "tenantId",
            type: "readonly",
     	    def: getTenantRefId()
        }, {
     	    label: $.i18n.prop('statusCol', lang),
     	    name: "status",
            type: "readonly",
            def: "UNKNOWN"
        }, {
     	    label: $.i18n.prop('enabledCol', lang),
     	    name: "enabled",
            type: "select",
            options: [{
            	label: $.i18n.prop('noLabel', lang),
            	value: "0"
            },{
            	label: $.i18n.prop('yesLabel', lang),
            	value: "1"
            }],
            def: "0"
        }, {
            label: $.i18n.prop('adminCol', lang),
            name: "admin",
            type: "select",
            options: [{
            	label: $.i18n.prop('noLabel', lang),
            	value: "0"
            },{
            	label: $.i18n.prop('yesLabel', lang),
            	value: "1"
            }],
            def: "1"
        }
    ].concat(injectAbstractFields());
    var userColumns = [
 	  {
            data: null,
            defaultContent: '',
            className: 'select-checkbox',
            orderable: true
       },
            {
            	data: "firstName"
            },{
            	data: "photo",
            	visible: false
            },
            {data: "lastName"},
            {data: "email"},
            {data: "enabled"},
            {data: "status"},
            {data: "admin"},
            {data: "identityProviderName"},
            {
         	   data: "createdAt",
         	   render: function(data){
         		   var date = new Date(data);
         		   return date.toUTCString();
         	   }
            }
    ];
    
    var tenantId = loggedInUserData.tenantId;
    if (activeTenant.refid) {
    	tenantId = activeTenant.refid;
    }
    var ajaxCfg = {
 		   saveUrl: "/api/users/save",
 		   editUrl: "/api/users/update",
 		   deleteUrl: "/api/users/delete",
  		   dataSourceUrl: "/api/users/findAll?tenantId="+tenantId +"&page=0&size=1000",
  		   jsonRoot: "userList"
    };
    var extra = {
    		order: [[ 9, "desc" ]],
    		// Control the fields visibility
    		// You might want to hide some fields on edit or on create
    		_fieldsVisibility_ : [{ 
    			action: "edit",
    			hideFields: ["userPoolId","tenantId","name","enabled","username","status","email"],
    			hideFieldsIfNotAdmin: ["admin"]
    		},{
    			action: "create",
    			hideFields: ["userPoolId","tenantId","name","enabled","username","status"],
    			hideFieldsIfNotAdmin: ["admin"]
    		}],
    		// Attach events on fields
    		_fieldEvents_ : [
    		{
    			field: "firstName",
    			eventCfg: [{
    				name: "keyup",
    				fn: function(field,editor) {
    					var firstName = sanitize(field.input().val());
    					var lastName = sanitize(editor.field("lastName").input().val());
    					editor.field("name").val(firstName+" "+lastName);
    				}
    			}]    			
    		},{
    			field: "lastName",
    			eventCfg: [{
    				name: "keyup",
    				fn: function(field,editor) {
    					var firstName = sanitize(editor.field("firstName").input().val());
    					var lastName = sanitize(field.input().val());
    					editor.field("name").val(firstName+" "+lastName);
    				}
    			}]
    		}, 
    		{
    			field: "email",
    			eventCfg: [{
    				name: "blur",
    				fn: function(field,editor) {
    					var mail = sanitize(field.input().val());
    					if (validateEmail(mail) === true) {
        					var alias = mail.split("@")[0];
        					editor.field("username").val(alias);  
    					}
    					else {
        					editor.field("username").val(null);        						
    					}
    				}
    			}]
    		}],
    		_customButtons_ : [
                {
                    text: 'Sync',
                    attr:  {
                        id: 'users-table-sync-button'
                    },
                    action: function ( e, dt) {
                    	var xmlhttp = new XMLHttpRequest();
                        showLoading(); 
                        var params = 'tenantId='+loggedInUserData.tenantId;
                        xmlhttp.open("GET", "/api/users/sync?"+params, true);
                        xmlhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                        xmlhttp.onreadystatechange = function() {
                            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                               if (xmlhttp.status === 200) {
                                   hideLoading();
                                   dt.ajax.reload(null,false);
                               }
                               else {
                                   if (xmlhttp.status === 409) {
                                       var result = xmlhttp.responseText;
                                       var jsonResult = JSON.parse(result);
                                       showError(jsonResult.message);
                                   }
                                   else {
                                       showError($.i18n.prop('signupError', lang));
                                   }                       
                                   hideLoading();
                               }
                            }
                        };                    
                        xmlhttp.send(params); 
                    }
                }, {
                    text: 'Import',
                    attr:  {
                        id: 'users-table-import-button'
                    },
                    action: function () {
                    	var wdw = $(".portal-inport-wdw");
                    	var select = $("#users-import-idp-name");
                    	var options = [];
                    	wdw.addClass("portal-inport-wdw-visible");
                    	$.each( idpEnum, function( optKey, optValue ) {                    		
                    		options.push('<option value="'+optValue.value+'">'+optValue.label+'</option>'); 
                    	});
                    	select.html(options);
                    }
                }
            ]
    }
    var panelBody = createGrid("users-table",tableHeadColumns,userColumns,editorFields,ajaxCfg,extra);
    return panelBody;
}



function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}
function showHideProfileSidebar() {
	var sideBar = $(".profile-sidebar");
    if (sideBar.hasClass('app-sidebar-open')) {
    	sideBar.removeClass('app-sidebar-open');
    }
    else {
    	sideBar.addClass('app-sidebar-open');
    } 
}

function hideProfileSidebar() {
	var sideBar = $(".profile-sidebar");
	sideBar.removeClass('app-sidebar-open');
}

function showHideSettingsSidebar() {
	var sideBar = $(".settings-sidebar");
    if (sideBar.hasClass('app-sidebar-open')) {
    	sideBar.removeClass('app-sidebar-open');
    }
    else {
    	sideBar.addClass('app-sidebar-open');
    } 
}

function showHideNotificationSidebar() {
	var sideBar = $(".notification-sidebar");
    if (sideBar.hasClass('app-sidebar-open')) {
    	sideBar.removeClass('app-sidebar-open');
    }
    else {
    	sideBar.addClass('app-sidebar-open');
    }
}

function showHideHelpSidebar() {
	var sideBar = $(".help-sidebar");
    if (sideBar.hasClass('app-sidebar-open')) {
    	sideBar.removeClass('app-sidebar-open');
    }
    else {
    	sideBar.addClass('app-sidebar-open');
    }
}


function hideRightSidebar() {
	var sideBar = $(".app-sidebar");
	sideBar.removeClass('app-sidebar-open');
}

function showNameUpdateForm() {
	var container = $(".portal-user-info");
	var nameUpdateForm = $(".portal-user-update-form")
	container.css({
		display:"none"
	});
	nameUpdateForm.css({
		display:"block"
	});
}

function hideNameUpdateForm() {
	var container = $(".portal-user-info");
	var nameUpdateForm = $(".portal-user-update-form")
	container.css({
		display:"block"
	});
	nameUpdateForm.css({
		display:"none"
	});
}

function showNotification(m,type) {
	hideNotification();
	var panel = $(".portal-notifications-dialog");
	var panelBody = $(".portal-notifications-dialog .display-table-cell");
	$(".portal-notifications-dialog").addClass("portal-notifications-visible");
	panel.removeClass("portal-notification-error portal-notification-success portal-notification-info");
	if (type === "success") {
		panel.addClass("portal-notification-success");
	}
	if (type === "error") {
		panel.addClass("portal-notification-error");
	}
	if (type === "info") {
		panel.addClass("portal-notification-info");
	}
	if (type === "warn") {
		panel.addClass("portal-notification-warning");
	}
	if (type === "validation") {
		panel.addClass("portal-notification-validation");
	}
	setTimeout(function() {
		hideNotification();
	},5000);
	panelBody.html(m);
}

function hideNotification() {
	var panel = $(".portal-notifications-dialog");
	var panelBody = $(".portal-notifications-dialog .display-table-cell");
	panel.removeClass("portal-notifications-visible").removeClass("portal-notification-success").removeClass("portal-notification-error").removeClass("portal-notification-warning").removeClass("portal-notification-validation");
	panelBody.html(null);
}

function updateProfileName() {
	var firstName = sanitize($("#portal-update-first-name").val());
	var lastName = sanitize($("#portal-update-last-name").val());
	loggedInUserData.firstName = firstName;
	loggedInUserData.lastName = lastName;	
	loggedInUserData.name = loggedInUserData.firstName+" "+loggedInUserData.lastName;
	showLoading();
    var xmlhttp = new XMLHttpRequest();
    var params = JSON.stringify(loggedInUserData);
    xmlhttp.open("PUT", "/api/users/update/"+loggedInUserData.id, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
           if (xmlhttp.status === 200) {                   
                hideLoading();
        		$('#managePersonalInfo').trigger('click');
        		showNotification($.i18n.prop('nameChanged', lang),"success");
        		getLoggedInUserData();
           }
           else {
               hideLoading();
           }
        }
    };                    
    xmlhttp.send(params);
}

//Start SSH key upload

function triggerKeyUpload(fileFieldId) {
	var elem = document.getElementById(fileFieldId);
	if(elem && document.createEvent) {
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		elem.dispatchEvent(evt);
	}
}


// Start upload avatar

function triggerAvatarUpload(fileFieldId) {
	var elem = document.getElementById(fileFieldId);
	if(elem && document.createEvent) {
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		elem.dispatchEvent(evt);
	}
}

function convertAvatar(fileFieldId, ctx, idAvatarHolder, callbackFn) {	
	var scaleFactor = {
			maxWidth: 320,
			maxHeight: 240
	}	
	var uploadLimit = 200; // file size limit in Kb
	if (typeof FileReader !== "undefined") {
	    var size = document.getElementById(fileFieldId).files[0].size/1024;	    
	    if (size >= uploadLimit) {
	    	showNotification($.i18n.prop('fileExceeds', lang)+uploadLimit+"kb"+$.i18n.prop('tryAgain', lang),"error");
	    	document.getElementById(fileFieldId).value = "";
	    	return;
	    }
	}
	
	var Resizer = function() {

	    var maxWidth = 0,
	        maxHeight = 0;
	    var canvas = document.createElement('canvas');
	    var img = new Image();
	    var callback;

	    var isFileOk = function(file) {
	        if (!file || !file.type.match(/image.*/)) {
	            return false;
	        };
	        return true;
	    }

	    img.onload = function() {
	        var dimensions = getResizedDimensions(img.width, img.height);
	        canvas.width = dimensions.width;
	        canvas.height = dimensions.height;
	        var ctx = canvas.getContext('2d');
	        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
	        if (callback) {
	            callback(canvas.toDataURL());
	            img.src = '';
	            ctx.clearRect(0, 0, canvas.width, canvas.height);
	        }
	    }
	    if (window.opera) { 
	        img.onerror = img.onload; 
	    }

	    var createObjectURL = function(file) {
	        if (window.webkitURL) {
	            return window.webkitURL.createObjectURL(file);
	        } else if (window.URL && window.URL.createObjectURL) {
	            return window.URL.createObjectURL(file);
	        } else {
	            return null;
	        }
	    }

	    var getResizedDimensions = function(initW, initH) {
	        var resizedWidth = maxWidth,
	            resizedHeight = maxHeight,
	            initialWidth = initW,
	            initialHeight = initH;
	        if (initialWidth <= maxWidth && initialHeight <= maxHeight) {
	            resizedWidth = initialWidth;
	            resizedHeight = initialHeight;
	        } else {
	            if (initialWidth < initialHeight) {
	                var calcWidth = initialWidth * resizedHeight / initialHeight;
	                if (calcWidth <= maxWidth) {
	                    resizedWidth = calcWidth;
	                } else {
	                    resizedHeight = resizedHeight * resizedWidth / calcWidth;
	                }
	            } else {
	                if (initialWidth > initialHeight) {
	                    var calcHeight = initialHeight * resizedWidth / initialWidth;
	                    if (calcHeight <= maxHeight) {
	                        resizedHeight = calcHeight;
	                    } else {
	                        resizedWidth = resizedWidth * resizedHeight / calcHeight;
	                    }
	                } else {
	                	if (scaleFactor.maxWidth > maxWidth) {
	                		resizedWidth = Math.Min(maxHeight, maxWidth);
	                	}
	                    resizedHeight = resizedWidth;
	                }
	            }
	        }
	        return {
	            width: resizedWidth,
	            height: resizedHeight
	        }
	    }

	    return {
	        scale: function(file, width, height, action) {
	            if (!isFileOk(file)) {
	                return;
	            }
	            maxWidth = width;
	            maxHeight = height;
	            callback = action;
	            img.src = createObjectURL(file);
	        },
	    }
	}
	var resizer = new Resizer();
    var file = document.getElementById(fileFieldId).files[0];
    
    var callback = function(scaledImg) {
    	if (idAvatarHolder) {
    		saveAvatar(scaledImg,idAvatarHolder);
    	}
    	else {
    		if (callbackFn) {
    			callbackFn(scaledImg);
    		}
    	}
    	
    }
    
    resizer.scale(file, 320, 240, callback);
    
}

function saveAvatar(scaledImg,idAvatarHolder) {
	
	loggedInUserData.photo = scaledImg;
	showLoading();
	var avatarHolder = $("#"+idAvatarHolder);
	var sideAvatarHolder = $(".profile-avatar-container");
    var xmlhttp = new XMLHttpRequest();
    var params = JSON.stringify(loggedInUserData);
    xmlhttp.open("PUT", "/api/users/update/"+loggedInUserData.id, true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
           if (xmlhttp.status === 200) {                   
                hideLoading();
                var newAvatar = scaledImg;
                if (newAvatar) {
                	sideAvatarHolder.css({
        	    		background: "url("+newAvatar+") center center no-repeat",
        	    		backgroundSize: "65px 65px",
        	    		display: "block"
        	    	});
        	    	avatarHolder.css({
        	    		background: "url("+newAvatar+") center center no-repeat",
        	    		backgroundSize: "120px 120px",
        	    		display: "block"
        	    	});
                }
                else {
                	sideAvatarHolder.css({
        	    		background: "url("+newAvatar+") center center no-repeat",
        	    		backgroundSize: "65px 65px",
        	    		display: "none"
        	    	});
        	    	avatarHolder.css({
        	    		background: "url("+newAvatar+") center center no-repeat",
        	    		backgroundSize: "120px 120px",
        	    		display: "none"
        	    	});
                }
                
        		showNotification($.i18n.prop('avatarSuccess', lang),"success");
           }
           else {
        	    hideLoading();
       			showNotification($.i18n.prop('avatarError', lang),"error");
           }
        }
    };                    
    xmlhttp.send(params);
}

function uploadAvatar() {
	return triggerAvatarUpload(idAvatarUploadField);
}


// End upload avatar

function initLanguagesCombo() {
	var container = $(".portal-languages-wrapper");
	var languages = portal.languages;
	var availableLanguages = JSON.parse(languages);
	var langOptions = [];
	var label = '<div class="portal-label">'+$.i18n.prop('langLabel', lang)+'</div>';
	
	$.each( availableLanguages, function( langKey, langValue ) {
		var selected = "";	
		if (getCookie("_fpLanguage") && getCookie("_fpLanguage") === langValue.code) {
			selected = "checked";
		}
		langOptions.push('<div style="margin-bottom:5px"><input type="radio" class="portal-lang-radio" name="language" id="lang-"'+langValue.code+'" value="'+langValue.code+'" '+selected+'>'+capitalizeFirstLetter(langValue.value)+'</div>'); 
	});
	container.html(label+langOptions.join(""));
}

function setConsent() {
	var consent = getCookie(consentCookieName);
	if (!consent) {
		setCookie(consentCookieName,"true",30);
    	hideNotification();
	}
}

$(document).on( 'click', ".close-window", function() {
    var wdw = $(this).parents(".app-window");        
    $(this).parents(".app-window").removeClass("window-visible");     
    if (wdw.hasClass("app-dynamic-window")) {
        $(this).parents(".app-window").empty();
//        $(this).parents(".app-window").remove();
        document.getElementById(wdw[0].id).remove();
    }
});

$(document).keyup(function(e) {
	if (e.key === "Escape") {
		$(".textarea-fullscreen").removeClass("textarea-fullscreen");
		if (panelMaximized === true) {
	    	panelToMinimize.removeClass("panel-maximized");
	    }
	    if (panelCollapsed === true) {
	    	panelToExpand.removeClass("panel-collapsed");
	    	var panelBody = panelToExpand.find(".portal-panel-body");
	    	panelBody.show();
	    }
	}    
});

function triggerUserUpload() {
	var fileFieldId = "users-import-file";
	var select = $("#users-import-idp-name");
	var uploadLimit = 200; // file size limit in Kb
	if (typeof FileReader !== "undefined" && document.getElementById(fileFieldId).files[0]) {
	    var size = document.getElementById(fileFieldId).files[0].size/1024;	    
	    if (size >= uploadLimit) {
	    	showNotification($.i18n.prop('fileExceeds', lang)+uploadLimit+"kb"+$.i18n.prop('tryAgain', lang),"error");
	    	document.getElementById(fileFieldId).value = "";
	    	return;
	    }
	}
    var file = document.getElementById(fileFieldId).files[0];
    var users = [];
    
    var wdw = $(".portal-inport-wdw");
    Papa.parse(file, {
    	complete: function(results) {
    		delete results.data[0];
    		var parsed = results.data;
    		for (var z =1; z<parsed.length-1; z++) {
    			users.push({
					"First name": parsed[z][0],
			        "Last name": parsed[z][1],
			        "Login name": parsed[z][2],
			        "Active?": parsed[z][3],
			        "Email": parsed[z][4]
    			});
			}
    		var payload = {
	    	  	  createdBy: loggedInUserData.username,
	    	  	  modifiedBy: loggedInUserData.username,
	    	  	  tenantId: getTenantRefId(),
	    	  	  userPoolId: activeTenant.userPoolId ? activeTenant.userPoolId : loggedInTenantData.userPoolId,
	    	  	  identityProviderName: select.val(),
	    	  	  externalUsers: users
    	    };
    	    var strPayload = JSON.stringify(payload);
            var xmlhttp = new XMLHttpRequest();
            showLoading(); 
            xmlhttp.open("POST", "/api/users/import", true);
            xmlhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === XMLHttpRequest.DONE) {

                    var result = xmlhttp.responseText;
                    var jsonResult = JSON.parse(result);
                   if (xmlhttp.status === 200) {
                       hideLoading();
	                   wdw.removeClass("portal-inport-wdw-visible");
                       showNotification(jsonResult.message,jsonResult.type.toLowerCase());
                	   wdw.removeClass("portal-inport-wdw-visible");
                	   var dt = $('#users-table').DataTable()
                       dt.ajax.reload(null,false);
                	   $("#users-import-file").val(null);
                   }
                   else {
                 	   showNotification($.i18n.prop('validationError', lang),"warn");                       
                 	   wdw.removeClass("portal-inport-wdw-visible");
                 	   hideLoading();
                	   $("#users-import-file").val(null);
                    }
                }
                
            };                    
            xmlhttp.send(strPayload); 
    	}
    });
}




function hideAllWindows() {
    $(".app-window").find(".close-window").trigger("click");
}

$(document).on('mousedown', function (e) {
    if ($(e.target).closest(".app-window").length === 0) {
    	hideAllWindows();
    }
});

$(document).ready(function() {
	
//	$("body,.app-list-container").niceScroll();	
	
	$('body').on('click', 'tbody tr td:not(.select-checkbox)', function() {
        $("#bufferedTickets").DataTable().rows( { selected: true } ).deselect();
      });
	
	$("body").on("click", ".menu-nav-right-wrapper a", function(){
		 $(".menu-nav-right-wrapper a:not(.user-action)").removeClass("top-active");
		 $(this).not(".user-action").addClass("top-active");
	});

	$("body").on("click", ".app-button", function(){
		 var callBackUrl = $(this).attr("data-callBackUrl");
		 var poolId = $(this).attr("data-poolId");
		 var appName = $(this).attr("data-appname");		 
		 return window.open(callBackUrl+'?access_token='+getCookie(portal.awsCookieName)+'&refresh_token='+getCookie(portal.awsRefreshCookieName)+'&pool_id='+poolId+'&app_name='+appName+'&theme=ext-theme-clarity&lang='+getCookie("_fpLanguage"));
	});
	
	$("body").on("click", ".dt-button:not(.disabled)", function(){
		 $(this).parents(".dt-buttons").find(".dt-button").removeClass("active");
		 $(this).addClass("active");
	});
	
	$.i18n.properties({ 
		name: 'messages', 
		path: 'i18n/', 
		mode: 'both', 
		language: getCookie(portal.awsLanguageCookieName) ? getCookie(portal.awsLanguageCookieName) : lang
	});
	
	$('body').on('change', '#tenants-combo-side-link, #tenantsComboProfile', function(e) {
		e.preventDefault();
		var combo = $(this);
		setActiveTenant(sanitize(combo.val()));
    });

	$('body').on('click', '.portal-esc-consent', function(e) {
		e.preventDefault();
		setConsent();
    });
	
	$('body').on('click', '#users-import-trigger', function() {
		var fileField = $("#users-import-file");
		fileField.click();
    });
	
	$('body').on('click', '#portal-inport-close', function() {
		var wdw = $(".portal-inport-wdw");
		wdw.removeClass("portal-inport-wdw-visible");
    });
	
	
	
	$('body').on('change', "#users-import-file", function() {
		return triggerUserUpload();
	});
	
	$('body').on('click', "#json-fullscreen-btn", function() {
		$('#json-fullscreen-btn').prev().addClass("textarea-fullscreen");
		showNotification($.i18n.prop('returnMessage', lang),"info");
	});
	
	$('body').on('change', "#"+idAvatarUploadField, function() {
		var idAvatarHolder = "portal-user-avatar-container";
		var ctx = $('#portal-user-update-form');
		return convertAvatar(idAvatarUploadField, ctx, idAvatarHolder)
	});
	
	$('body').on('change', "#services-instances-avatar-input", function() {
		var fn = function(scaledImg) {
			var field = $('#DTE_Field_value');
			field.val(scaledImg);
			$(".portal-avatar-preview").css({
				background: "url("+scaledImg+") no-repeat center center"
			});
		}
		return convertAvatar("services-instances-avatar-input", null, null, fn)
	});
	
	
	$('body').on('click', "#delete-ssh-key", function() {

		var refId = selectedParam.refid;
		var tenantId = getTenantRefId();
		var env = selectedServiceInstance.environment;
		
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("DELETE", "/api/storage/delete?tenantId="+tenantId+"&refId="+refId+"&environment="+env, true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
               if (xmlhttp.status === 200) {
            	   var field = $('#DTE_Field_value');
            	   field.val("");
	       		   currentEditorInstance.submit();
	       		   $('#services-instances-key-input').val("");
               }
               else {
                   hideLoading();
                   console.log("error");
	       		   $('#services-instances-key-input').val("");
               }
            }
        };                    
        xmlhttp.send();
	});

	
	$('body').on('change', "#services-instances-key-input", function() {
		var id = $(this).attr("id");
		
		var file = document.getElementById(id).files[0];
		var fileName = file.name;
		var refId = selectedParam.refid;
		var dataType = "param";
		var tenantId = getTenantRefId();
		
		var formData = new FormData();
		formData.append("file", file);
		formData.append("fileName", fileName);
		formData.append("refId", refId);
		formData.append("dataType", dataType);
		formData.append("tenantId", tenantId);
		formData.append("environment", selectedServiceInstance.environment);
		
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("POST", "/api/storage/upload", true);
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === XMLHttpRequest.DONE) {
               if (xmlhttp.status === 200) {
                   var field = $('#DTE_Field_value');
	       		   field.val(sanitize(fileName));
	       		   currentEditorInstance.submit();
	       		   $('#services-instances-key-input').val("");
               }
               else {
                   hideLoading();
                   console.log("error");
	       		   $('#services-instances-key-input').val("");
               }
            }
        };                    
        xmlhttp.send(formData);
	});
	
	$('body').on('change', ".portal-lang-radio", function() {
		eraseCookie(portal.awsLanguageCookieName);
		setCookie(portal.awsLanguageCookieName,this.value,30);
		window.location.href="/?language="+this.value;
	});
	
	$("#signInNextBtn").on("click", function() {
        $("#signInPasswordInput").val("");          
    });

	$('body').on('click', '#portal-user-password-cancel', function() {
		var container = $(".portal-user-info");
    	var nameUpdateForm = $(".portal-user-update-form");
    	var passwordUpdateForm = $(".portal-user-password-reset-form");
    	container.css({
    		display:"block"
    	});
    	passwordUpdateForm.css({
    		display:"none"
    	});
    	nameUpdateForm.css({
    		display:"none"
    	});  
    	passwordUpdateForm.find('input').val('');
    });
	
	$(".user-action").on("click", function(e) {
        e.preventDefault();
        hideRightSidebar();
        showHideProfileSidebar();
    });
	
	$(".settings-action").on("click", function(e) {
        e.preventDefault();
        hideRightSidebar();
        hideProfileSidebar();
        showHideSettingsSidebar();
    });
	
	$(".portal-panel-close").on("click", function(e) {
        e.preventDefault();
        hideRightSidebar();
    });
	
	$('body').on('click', ".panel-close", function(e) {
        e.preventDefault();
        var parentPanel = null;
        var panel = jQuery(this).closest(".portal-panel");
        if (panel.hasClass("portal-detail-grid") || panel.hasClass("portal-master-grid")) {
        	parentPanel = panel;
        }
        else {
        	parentPanel = panel.parent();
        }
        var panelBody = parentPanel.find(".portal-panel-body");
		panelBody.remove();
		parentPanel.removeClass("panel-visible");
    });
	
	$('body').on('click', ".panel-maximize", function(e) {
        e.preventDefault();
        var parentPanel = null;
        var panel = jQuery(this).closest(".portal-panel");
        var consent = getCookie(consentCookieName);
        if (panel.hasClass("portal-detail-grid") || panel.hasClass("portal-master-grid")) {
        	parentPanel = panel;
        }
        else {
        	parentPanel = panel.parent();
        }
        if (parentPanel.hasClass("panel-maximized")) {
        	parentPanel.removeClass("panel-maximized");
        	$('.left-sidebar').css({
        		display: "block"
        	});
        	panelMaximized = false;
        	panelToMinimize = null;
        }
        else {
        	parentPanel.addClass("panel-maximized");
        	$('.left-sidebar').css({
        		display: "none"
        	});
        	panelMaximized = true;
        	panelToMinimize = parentPanel;
        	if (!consent) {
        		showNotification($.i18n.prop('returnMessage', lang)+" <a href='#' class='portal-esc-consent'>"+$.i18n.prop('understand', lang)+"</a>","info");
        	}
        }
    });
	
	$('body').on('click', ".panel-refresh", function(e) {
        e.preventDefault();
        auditStopFlag = false;
        auditHasMore = true;
        var tableId = $(this).closest(".portal-panel").find(".dataTable").attr("id");
//        $("#"+tableId).DataTable().clear().draw(false);
//        $("#"+tableId).DataTable().ajax.reload(null,false);
//        $("#"+tableId).DataTable().draw();
        $("#"+tableId).DataTable().ajax.reload( null, false );
    });
	
	$('body').on('click', ".panel-collapse", function(e) {
        e.preventDefault();
        var parentPanel = null;
        var panel = jQuery(this).closest(".portal-panel");
    	var consent = getCookie(consentCookieName);
        if (panel.hasClass("portal-detail-grid") || panel.hasClass("portal-master-grid")) {
        	parentPanel = panel;
        }
        else {
        	parentPanel = panel.parent();
        }
        var panelBody = parentPanel.find(".portal-panel-body");
        if (parentPanel.hasClass("panel-collapsed")) {
        	parentPanel.removeClass("panel-collapsed");
        	panelCollapsed = false;
        	panelToExpand = null;
        	panelBody.show();
        }
        else {
        	parentPanel.addClass("panel-collapsed");
        	panelCollapsed = true;
        	panelToExpand = parentPanel;
        	panelBody.hide();
        	if (!consent) {
        		showNotification($.i18n.prop('returnMessage', lang)+" <a href='#' class='portal-esc-consent'>"+$.i18n.prop('understand', lang)+"</a>","info");
        	}
            
        }
    });
	
	$(".notification-action").on("click", function(e) {
        e.preventDefault();
        hideRightSidebar();
        showHideNotificationSidebar();    
    });
	
	$(".help-action").on("click", function(e) {
        e.preventDefault();
        hideRightSidebar();
        showHideHelpSidebar();    
    });
	
	$(".app-content").on("click", function() {
        hideRightSidebar(); 
    });
	
	$('.app-search-term').keyup(function() {
	    var input = this.value;
	    var apps = $('.app');
	    delay(function(){
	    	$.each( apps, function( appKey, app ) {	
	    		var appTitle = app.querySelector('.app-title').innerHTML.toLowerCase();
	            if (appTitle.indexOf(input) === -1) {
	            	app.style.display = "none";
	            }
	            else {
	            	app.style.display = "inline-block";
	            }
	    	});
	    }, 300 );
	});
	
	$("#managePersonalInfo").on("click", function(e) {
        e.preventDefault();                              
         tenantObj = loggedInTenantData;
         var firstName = loggedInUserData.firstName;
         var lastName = loggedInUserData.lastName;
         var avatar = loggedInUserData.photo;
         var name = firstName+" "+lastName;
         var email = loggedInUserData.email;  
         var changePassBtn = '<div id="button-change-password">'+$.i18n.prop('changePass', lang)+'</div>';
     	 var idp = loggedInUserData.identityProviderName;
     	 if (idp !== "COGNITO") {
     		changePassBtn = "";
     	 }
     	 var avatarDisplay =  "display:none";
     	 if (avatar) {
     		avatarDisplay =  "display:block";
     	 }
         var form = '<form class="portal-user-update-form" id="portal-user-update-form" method="post" action=""><h1>'+$.i18n.prop('updateInfo', lang)+'</h1><div style="margin-top:15px"><input type="text" name="firstName" maxlength="30" value="'+firstName+'" id="portal-update-first-name"><input type="text" maxlength="30" name="lastName" value="'+lastName+'" id="portal-update-last-name"></div><div class="display-table" style="margin-top:5px"><div class="display-table-cell"><input class="button" type="submit" style="margin-right: 7px" id="portal-user-update-submit" value="Submit"></div><div class="display-table-cell"><div class="button" id="portal-user-update-cancel">Cancel</div></div></div></form>';
         var passwordResetForm = '<form class="portal-user-password-reset-form" method="post" action=""><h1>'+$.i18n.prop('resetPassword', lang)+'</h1><div style="margin-top:15px">'+$.i18n.prop('resetPasswordMsg', lang)+'</div><div style="margin-top:15px"><input type="text" name="code" id="portal-user-reset-code" placeholder="'+$.i18n.prop('resetCodePlaceholder', lang)+'" required></div><div><input required type="password" name="password" id="portal-user-reset-password" style="margin-bottom:0px" placeholder="'+$.i18n.prop('newPasswordlaceholder', lang)+'"></div><div style="margin-top:5px" class="password-error-container">'+$.i18n.prop('passPolicy', lang)+'</div><div><input required type="password" name="repeat-password" id="portal-user-reset-password-repeat" placeholder="'+$.i18n.prop('repeatPasswordPlaceholder', lang)+'"></div><div class="display-table" style="margin-top:5px"><div class="display-table-cell"><input class="button" type="submit" style="margin-right: 7px" id="portal-user-password-submit" value="'+$.i18n.prop('submitPlaceholder', lang)+'"></div><div class="display-table-cell"><div class="button" id="portal-user-password-cancel">'+$.i18n.prop('cancelBtn', lang)+'</div></div></div></form>';
         var avatarBody = '<div class="portal-user-avatar-wrapper"><div class="portal-user-avatar" id="portal-user-avatar-container" style="'+avatarDisplay+';background:#f0f0f0 url('+avatar+') no-repeat center center; background-size: 120px 120px"></div><div class="profile-avatar-inner"><div class="profile-avatar-initials">'+firstName.charAt(0)+lastName.charAt(0)+'</div></div></div><input type="file" id="'+idAvatarUploadField+'" style="display:none" accept="image/gif, image/jpeg, image/png"><a href="#" id="portal-edit-avatar-link">'+$.i18n.prop('addPicture', lang)+'</a>';
         var infoBody = '<div class="portal-user-info"><h1 id="portal-user-name">'+name+'</h1><a href="#" id="portal-edit-name-link">'+$.i18n.prop('editName', lang)+'</a><div id="portal-user-email">'+email+'</div>'+changePassBtn+'</div>'+form+passwordResetForm;
         var body = '<div class="display-table"><div class="display-table-cell vertical-top align-center">'+avatarBody+'</div><div class="display-table-cell vertical-top">'+infoBody+'</div></div>';
         createSimplePanel($.i18n.prop('personalInfo', lang),body,"master"); 
    });
	
	$("#manageSettings").on("click", function(e) {
        e.preventDefault();                              
        var html = "<div class='portal-label'>Choose an active tenant from the list bellow</div>";
         createSimplePanel($.i18n.prop('settings', lang),"<div>"+html+buildTenantsCombo()+"</div>","master"); 
//         $('select').selectric();
//     	$('.selectric-scroll').niceScroll();
    });
	
	$("#manageAnalytics").on("click", function(e) {
        e.preventDefault();
        showAnalytics();
    });
	
	$('body').on('click', '#portal-edit-name-link', function(e) {
		e.preventDefault();
		showNameUpdateForm();
    });
	
	$('body').on('click', '#services-instances-avatar-btn', function(e) {
		e.preventDefault();
		triggerAvatarUpload("services-instances-avatar-input");
    });
	
	$('body').on('click', '#services-instances-key-btn', function(e) {
		e.preventDefault();
		triggerKeyUpload("services-instances-key-input");
    });
	
	$("#edit-profile-side-link").on("click", function(e) {
		e.preventDefault();
		$("#managePersonalInfo").trigger("click");
		showHideProfileSidebar();
    });
	
	$("#view-account-side-link").on("click", function(e) {
		e.preventDefault();
		$("#manageTenants").trigger("click");
		showHideProfileSidebar();
    });
	
	$('body').on('click', '#portal-edit-avatar-link', function(e) {
		e.preventDefault();
		uploadAvatar();
    });
	
	$('body').on('click', '#portal-user-update-cancel', function(e) {
		e.preventDefault();
		hideNameUpdateForm();
    });
	
	$('body').on('click', '#button-change-password', function(e) {
		e.preventDefault();
		var clientId = tenantObj.clientId;
		var userPoolId = tenantObj.userPoolId;
		var user = loggedInUserData.email;
		$("#portal-user-password-submit").val(sanitize($.i18n.prop('submitPlaceholder', lang)));
		initChangePasswordProfile(clientId,userPoolId,user);
		
    });
	
	$('body').on('click', '#portal-user-update-submit', function(e) {
		e.preventDefault();
		updateProfileName();
    });
	
	$(document).on('keypress', '.portal-user-update-form', function(e) {
		if(e.which === 13) {
			updateProfileName();
		}
    });
	
	$("#manageServices").on("click", function(e) {
        e.preventDefault();
        var servicesRowClickFn = function(dataTable,record,row) {
        	var dataTableId = dataTable.tables().nodes().to$().attr('id');
        	var masterDetailContainer = $("#"+dataTableId).parents(".master-detail-container");
        	var detailPanel = masterDetailContainer.find(".portal-detail-grid .dataTable");
        	var sidebarPanel = jQuery(".app-data-details");
    		var sidebarPanelBody = jQuery(".app-data-details .portal-panel-body");
        	var dt = detailPanel.DataTable();
        	selectedServiceId = record[0].id;
        	serviceCode = record[0].code;
        	
        	// Make an AJAX resquest to check if we have any results
        	
        	var checkResultsFn = function(url, onSuccessCallBack) {
        		var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", url, true);
                xmlhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                       if (xmlhttp.status === 200) {
                    	   var result = xmlhttp.responseText;
                    	   var resultJson = JSON.parse(result);
                           if (resultJson._embedded.linkedHashMapList[0].rel === null) {
                        	   return;
                           }
                           else {
                        	   onSuccessCallBack();
                           }
                       }
                    }
                };                    
                xmlhttp.send(); 
                
        	}
        	
        	
        	if (dt.ajax.url().indexOf("serviceCode") > -1 && dt.ajax.url().indexOf("tenantId") > -1) {
        		var url = dt.ajax.url().toString();
        		var newurl = updateQueryStringParameter(url,"serviceCode",record[0].code);
        		var callBack = function() {
        			dt.ajax.url(newurl).load();
        		}
        		checkResultsFn(newurl, callBack);
        		
        	} else {
        		var callBack = function() {
        			dt.ajax.url(dt.ajax.url()+"&serviceCode="+serviceCode).load();
        		}
        		checkResultsFn(dt.ajax.url()+"&serviceCode="+serviceCode, callBack);
        	}
        	
        	sidebarPanelBody.remove();
        	sidebarPanel.removeClass("panel-visible");
    		dt.buttons().enable();
        }
        
        var servicesDeselectFn = function(dataTable,record,row) {
        	var serviceInstancesTable = $('#services-instances-table tbody');
        	var serviceInstancesDt = $('#services-instances-table').DataTable();
        	var serviceInstancesColumns = $('#services-instances-table thead th');
        	var columnsCount = serviceInstancesColumns.length;
        	serviceInstancesTable.empty();
        	serviceInstancesDt.buttons().disable();
        	serviceInstancesTable.html("<tr class='odd'><td colspan='"+columnsCount+"' style='text-align:center'>"+$.i18n.prop('zeroRecords', lang)+"</td></tr>");
        }
    	
    	var serviceInstanceRowDeselectFn = function(dataTable,record,row) {
    		// to be implemented
        }
    	
    	var serviceInstanceRowSelectFn = function(dataTable,record,row) {
    		selectedServiceInstance = record[0];
    		var sidebarPanel = $(".app-data-details");
    		if (sidebarPanel.hasClass("panel-visible")) {
    			var paramsBtn = $(row).find(".button-cell button")[0];
    			editParameters(paramsBtn,"services-instances-table");
    			
    		}    		
        }
    	
    	var masterTools = ["maximize","collapse"];
    	var detailTools = ["maximize","collapse"];
    	
        createMasterDetailPanel($.i18n.prop('servicesTitle', lang),buildServicesTable(servicesRowClickFn, servicesDeselectFn),$.i18n.prop('serviceInstancesTitle', lang),buildServiceInstancesTable(serviceInstanceRowSelectFn,serviceInstanceRowDeselectFn),masterTools,detailTools);
    });
	
	$("#manageSubscriptions").on("click", function(e) {
        e.preventDefault();
        showServiceInstances();
    });
	
	$("#manageTenants").on("click", function(e) {
        e.preventDefault();
        showTenants();
    });
	
	$("#manageAudit").on("click", function(e) {
        e.preventDefault();
        showAudit();
    });
	
	$(".feedback-window .close-window").on("click", function() {
		hideLoading();
        $(".feedback-window").removeClass("feedback-window-visible");	
        $("#feedback-input").val("");
        $("#feedback-category").val("");
		$("#feedback-type").val("");
        $(".file-drag-msg").html(dragAreaMsg);	
	});
	
	$("#give-feedback-trigger").on("click", function(e) {
        e.preventDefault();
        showLoading(true);
        $(".feedback-window").addClass("feedback-window-visible");
    });

    $('body').on('change', "#file-upload-field", function(e) {        
        filesArray = [];
        var files = document.getElementById('file-upload-field').files;
        filesArray = files;                 
        var fileListHtml = [];
        $.each( filesArray, function( index, val ) {  
            fileListHtml.push("<div style='font-size:14px; margin-bottom:7px; font-weight:400; box-sizing: border-box;  padding:0px 20px; text-align:left'><i class='fa fa-file-text-o'></i> "+val.name+"</div>");                
        });
        $(".file-drag-msg").html(fileListHtml.join(""));
		//upload(file);
	});

    $('body').on('click', ".file-upload-trigger", function() {
        triggerUpload("file-upload-field");
    });

	$('body').on('click', '.send-feedback', function(e) {
		e.preventDefault();
		hideLoading();
        $(".feedback-window").removeClass("feedback-window-visible");	
        sendFeedback();
    });
	

    
    $('#file-drag-area').on(
        'dragover',
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    )
    $('#file-drag-area').on(
        'dragenter',
        function(e) {
            e.preventDefault();
            e.stopPropagation();
        }
    )
    $('#file-drag-area').on(
        'drop',
        function(e){
            if(e.originalEvent.dataTransfer){
                if(e.originalEvent.dataTransfer.files.length) {
                    
                    filesArray = [];
                    e.preventDefault();
                    e.stopPropagation();
                    /*UPLOAD FILES HERE*/
                    filesArray = e.originalEvent.dataTransfer.files;                    
                    var fileListHtml = [];
                    $.each( filesArray, function( index, val ) {  
                        fileListHtml.push("<div style='font-size:14px; margin-bottom:7px; font-weight:400; box-sizing: border-box;  padding:0px 20px; text-align:left'><i class='fa fa-file-text-o'></i> "+val.name+"</div>");                
                    });

                    $(".file-drag-msg").html(fileListHtml.join(""));
                }   
            }
        }
    )
	
	$("#manageUsers").on("click", function(e) {
        e.preventDefault();
        showUsers();
    });
    
	$("#home").on("click", function(e) {
        e.preventDefault();
        
        var dashboard = $(".app-dashboard");
        var appBody = $(".app-data-container");
        var appListBody = $(".app-list-container");
        var tenantRefId = getTenantRefId();
        
        appBody.empty();
        appListBody.empty();
        dashboard.show();
    	getAppList(tenantRefId);
    });
    
    $("#menuTrigger a").on("click", function() {
        var leftSideBar = $(".left-sidebar");
        if (leftSideBar.hasClass('left-sidebar-click-open')) {
            leftSideBar.removeClass('left-sidebar-open').removeClass('left-sidebar-click-open');
            $(".app-content").removeClass('app-content-click-open');
        }
        else {
            leftSideBar.addClass('left-sidebar-open').addClass('left-sidebar-click-open');
            $(".app-content").addClass('app-content-click-open');
        }     
    });
    
    var menuTimeout = null;
    
    $(".left-sidebar").mouseenter(function() {
    	var leftSideBar = $(".left-sidebar");    	
        if (!leftSideBar.hasClass('left-sidebar-click-open')) {
        	menuTimeout = setTimeout(function() {
        		if (!leftSideBar.hasClass('left-sidebar-open')) {
            		leftSideBar.addClass('left-sidebar-open');
            		clearTimeout(menuTimeout);
        		}
        	},500);
        }
    });
    $(".left-sidebar").mouseleave(function() {
    	var leftSideBar = $(".left-sidebar");
    	if (!leftSideBar.hasClass('left-sidebar-click-open')) {
        	leftSideBar.removeClass('left-sidebar-open');        	
			clearTimeout(menuTimeout);
        } 
    });
    
    $(".left-sidebar li a").on("click", function() {
//    	var linkEffect = $(this).find(".link-effect");
//    	linkEffect.animate({
//    		width: 300,
//    		height:300,
//    		opacity:1
//    	}, {
//    		complete: function() {
//    			console.log("ok");
////    			linkEffect.animate({
////    				width: 1,
////    	    		height:1,
////    	    		opacity:0
////    			});
//    		},
//    		duration:100
//    	});
//    	
    	$(".left-sidebar li a").each(function() {
            $(this).removeClass("link-active");
        });
		var sidebarPanelBody = jQuery(".app-data-details .portal-panel-body");
    	var sidebarPanel = jQuery(".app-data-details");
    	sidebarPanel.removeClass("panel-visible");
		sidebarPanelBody.remove();
		sidebarPanel.removeClass("sidebar-sisible");
		$(this).addClass("link-active");
    });
    
    
    $(".profile-logout a").on('click',function(e) {
        e.preventDefault();
        eraseCookie(portal.awsCookieName);
        eraseCookie(portal.awsRefreshCookieName);
        eraseCookie(portal.awsTenantCodeCookieName);
	    eraseCookie("_fpActiveTenant");
		window.localStorage.removeItem('loggedInTenantData');
        // Touch logout endpoint
        
        var params = 'client_id='+loggedInTenantData.clientId+"&logout_uri="+loggedInTenantData.logoutUrl+"&redirect_uri="+loggedInTenantData.callbackUrl+"&response_type=CODE";
        window.location.href="https://"+loggedInTenantData.domainUrl+"/logout?"+params;
    });
    
    $(".change-password-form > form").on('submit',function(e) {
        e.preventDefault();
    });
    
    $(".first-step form").on("submit", function(e) {
        e.preventDefault();    
        var data =  $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {}); 
        var email = data.email;
        if (email !== "") {
            showLoading();
            var xmlhttp = new XMLHttpRequest();
            var params = 'email='+email;
            xmlhttp.open("GET", "https://api-gateway-features.fuelplus.com/user-management-service/api/users/findByEmail?"+params, true);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                   if (xmlhttp.status === 200) {
                       var result = xmlhttp.responseText;
                       var jsonResult = JSON.parse(result); 
                        hideLoading();
                        hideAttachedError($("#signInEmailInput"));
                        if (jsonResult.tenantId && portal.name) {
                            showLoading();
                            var tenant = new XMLHttpRequest();
                            var tenantParams = 'userPoolId='+jsonResult.userPoolId+"&clientName="+portal.name;
                            tenant.open("GET", "https://api-gateway-features.fuelplus.com/provisioning-service/api/identity-provider/getUserPoolClient?"+tenantParams, true);
                            tenant.onreadystatechange = function() {
                                if (tenant.readyState === XMLHttpRequest.DONE) {
                                   if (tenant.status === 200) {
                                       var tenantResult = tenant.responseText;
                                       var tenantJsonResult = JSON.parse(tenantResult); 
                                   	   localStorage.setItem('loggedIntenantData', JSON.stringify(tenantJsonResult));                      
                                        hideLoading();
                                        hideAttachedError($("#signInEmailInput"));
                                        $(".second-step input[name='clientId']").val(sanitize(tenantJsonResult.clientId));
                                        $(".second-step input[name='userPoolId']").val(sanitize(tenantJsonResult.userPoolId));
                                        callbackUrl = tenantJsonResult.callbackUrl;
                                        
                                        var identityProvider = jsonResult.identityProviderName;
                                        
                                        if (identityProvider && identityProvider !== "COGNITO") {
                                        	var domain = tenantJsonResult.domainUrl;
                                        	var appId = tenantJsonResult.clientId;
                                        	var redirectUrl = tenantJsonResult.callbackUrl;  
                                        	showLoading();
                                        	var url = "https://"+domain+"/oauth2/authorize?identity_provider="+identityProvider+"&redirect_uri="+redirectUrl+"&response_type=CODE&client_id="+appId+"&state=STATE&scope=openid+profile+aws.cognito.signin.user.admin";
                                        	window.location.href = url;	
                                            
                                        }
                                        else {
                                        	 $(".first-step").css({
	 	                                            display: "none" 
	 	                                     });
	 	                                     $(".second-step").css({
	 	                                        display: "block" 
	 	                                     });
	 	                                     $(".second-step h3").html(jsonResult.email);
	 	                                     $(".second-step input[name='password']").focus();
	 	                                     $(".second-step input[name='email']").val(sanitize(jsonResult.email));
	 	                                     $(".second-step input[name='user']").val(sanitize(jsonResult.email));
                                        }
                                        $("#signInEmailInput").val(""); 
                                        
                                   }
                                   else {
                                       hideLoading();
                                       showError($.i18n.prop('userNotFound', lang)+"<div class='portal-error-details'>"+$.i18n.prop('userCaseSensitive', lang)+"</div>",$("#signInEmailInput"));
                                       $("#signInEmailInput").val(""); 
                                   }
                                }
                            };                    
                            tenant.send(tenantParams);
                        }
                   }
                   else {
                       hideLoading();
                       showError($.i18n.prop('userNotFound', lang)+"<div class='portal-error-details'>"+$.i18n.prop('userCaseSensitive', lang)+"</div>",$("#signInEmailInput"));
                   }
                }
            };                    
            xmlhttp.send(params);
        }
        else {
            showError($.i18n.prop('findByEmail', lang),$("#signInEmailInput"));
        }
    });

    $(".second-step form").on("submit", function(e) {
        e.preventDefault();    
        var data =  $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {}); 
        var pass = data.password; 
        var user = data.user;  
        if (user !== "" && pass !== "") {
            hideError();
            showLoading();
            return auth(data);
        }
        else {
            showError($.i18n.prop('enterpassword', lang));
        }
    });

    $(".back-to-first-step").on("click", function(e) {
        e.preventDefault();       
        hideError();
        $(".first-step").css({
           display: "block" 
        });
        $(".second-step").css({
           display: "none" 
        });
    });

    $(".back-to-second-step").on("click", function(e) {
        e.preventDefault();  
        hideError();
        $(".second-step").css({
           display: "block" 
        });
        $(".third-step").css({
           display: "none" 
        });
    });

    $(".create-account-link").on("click", function(e) {
        e.preventDefault();  
        var firstStep = $(".first-step");
        var secondStep = $(".second-step");
        var thirdStep = $(".third-step");
        var forms = [firstStep,secondStep,thirdStep];
        var registrationForm = $(".registration-form");
        $(forms).each(function() {
            $(this).css({
               display: "none" 
            });
        });
        registrationForm.css({
           display: "block" 
        });

    });
    
    $(".reset-password-link").on("click", function(e) {
        e.preventDefault();  
    	initForgotPassword();
    });

    $(".back-to-login").on("click", function(e) {
        e.preventDefault();  
        var firstStep = $(".first-step");
        var registrationForm = $(".registration-form");
        var resetPasswordForm = $(".reset-password-form");
        var changePasswordForm = $(".change-password-form");
        var successPasswordChange = $(".success-password-change");
        firstStep.css({
           display: "block" 
        });
        registrationForm.css({
           display: "none" 
        });
        resetPasswordForm.css({
            display: "none" 
         });
        changePasswordForm.css({
            display: "none" 
         });
        successPasswordChange.css({
            display: "none" 
         });
        hideError();
        clearPasswordForm();
    });

    $(".registration-form form").find('input,button').focus(function() {
        hideError();
    });
    
    $('.registration-form form input').each(function(){
      $(this).blur(function() {
          if (!$(this).val()) {
              formValid = false;
          }
          else {              
              formValid = true;
          }
      });
    });
    
    $(".reset-password-form form").on("submit", function(e) {  
    	e.preventDefault();
    	initForgotPassword();
    });
    
    
    $(".change-password-form form").on("submit", function(e) {  
    	e.preventDefault();    	
    });

    $(".registration-form form").on("submit", function(e) {
        e.preventDefault();
        var registrationForm = $(".registration-form");
        var confirmationForm = $(".confirmation-form");
        var data =  $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
        if (formValid === true && emailExists === false) {
            var payLoad = {
            	companyCode : data.company_code,
            	companyName : data.company_name,
                email : data.email,
                name : data.name
            }
            var payloadString = payLoad;            
            var params = JSON.stringify(payloadString);
            var xmlhttp = new XMLHttpRequest();
            showLoading(); 
            xmlhttp.open("POST", "/api/register", true);
            xmlhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                   if (xmlhttp.status === 200) {
                       hideLoading();
                        registrationForm.css({
                           display: "none" 
                        });
                        confirmationForm.css({
                           display: "block" 
                        });
                   }
                   else {
                       if (xmlhttp.status === 409) {
                           var result = xmlhttp.responseText;
                           var jsonResult = JSON.parse(result);
                           showError(jsonResult.message);
                       }
                       else {
                           showError($.i18n.prop('signupError', lang));
                       }                       
                       hideLoading();
                   }
                }
            };                    
            xmlhttp.send(params);            
        }
        else {
            if (!isEmail($('#registration_email').val()) && formValid === true) {
                showError($.i18n.prop('invalidEmail', lang));
            }
            else {
                if (emailExists === false || formValid === false) {
                    showError($.i18n.prop('fillFields', lang));
                }
            }
        }
    });
    
    $(".third-step form").on("submit", function(e) {
        e.preventDefault();
        var newData =  $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
        
        if (newData.newPassword && newData.repeatPassword && newData.newPassword===newData.repeatPassword) {
            auth(newData,true,newData.repeatPassword);
        }
        else {
            showError($.i18n.prop('passwordsDoNotMatch', lang));
        }

    });

    $(".sign-in-link").on("click", function() {
        var firstStep = $(".first-step");
        var registrationForm = $(".registration-form");
        firstStep.css({
           display: "block" 
        });
        registrationForm.css({
           display: "none" 
        });
        $('.email-error').css({
           display: "none" 
        });  
    });

    $('#registration_email').blur(function(e){
        e.preventDefault();
        if ($(this).val) {
            if ($('#registration_email').val() !== "" && isEmail($('#registration_email').val())) {
                hideError();
                emailExists = false;
                showLoading();                
                var xmlhttp = new XMLHttpRequest();
                var params = "email="+$('#registration_email').val();
                xmlhttp.open("GET", "/api/users/existsByEmail?"+params, true);
                xmlhttp.setRequestHeader("content-type", "application/json");
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                       if (xmlhttp.status === 200) {
                           var result = xmlhttp.responseText;
                           if (result === "true") {
                                emailExists = true;
                                $('.email-error').css({
                                   display: "block" 
                                });
                            }
                            else {
                                $('.email-error').css({
                                   display: "none" 
                                });  
                            }
                            hideLoading();
                       }
                       else {
                           hideLoading();
                       }
                    }
                };                    
                xmlhttp.send();
            }
            if ($('#registration_email').val() !== "" && !isEmail($('#registration_email').val())) {
                emailExists = true;
            }
        }
    });
    
    initLanguagesCombo();
	
	$(".portal-doc-url").attr("href",portal.doc);
	$(".portal-doc-new-url").attr("href",portal.doc+"whatsnew/");
	
});