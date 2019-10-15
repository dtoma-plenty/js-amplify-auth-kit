import Amplify from '@aws-amplify/core'
import Auth from '@aws-amplify/auth';
import * as helper from './helpers.js';
import * as cfg from './config.js';

var callbackUrl = null, formValid = false, emailExists = false, changePassUser = null;


export function initChangePassword(clientId,userPoolId,user) {

    Amplify.configure({
	    Auth: {
	        userPoolId: userPoolId,
	        clientId: clientId,
	        userPoolWebClientId: clientId
	    }
	});

    Auth.forgotPassword(user)
    .then(data => {
        var secondStepForm = $(".second-step");
        var changePasswordForm = $(".change-password-form");
        secondStepForm.css({
            display: "none" 
        });
        changePasswordForm.css({
            display: "block" 
        });
        $(".change-password-form-banner h3").html(user);
        $(".success-password-form-banner h3").html(user);
        changePassUser = user;
    })
    .catch(err => {
        helper.hideLoading();
        helper.showError(err.message);
    });
}

export function validateChangePassword() {
	var p2 = $("#change_repeat_password");
	var code = $("#change_verification_code");
	var p2Val = p2.val();
	var codeVal = helper.sanitize(code.val());
	if (p2Val) {
        helper.hideError();
        var term = p2Val;
        var re = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
        if (re.test(term)) {
            Auth.forgotPasswordSubmit(changePassUser, codeVal, p2Val)
            .then(data => {
                changePassUser = null;
                helper.hideLoading();
                $(".success-password-change").css({
                    display: "block"
                });
                $(".change-password-form").css({
                    display: "none"
                });
                $(".change-password-form form").trigger("reset");
            })
            .catch(err => {
                helper.hideError();
                helper.hideLoading();
                helper.showError(err.message);
            });
        } else {
            helper.hideError();
            helper.showError(i18n.policyNotMet);
        }
    }
}

export function shrinkLogo() {
    $(".form-logo").addClass("logo-small");
}

export function expandLogo() {
    $(".form-logo").removeClass("logo-small");
}

export function initForgotPassword() {
	
	helper.showLoading();
	var email = helper.sanitize($('#forgot_pass_email').val());
    var xmlhttp = new XMLHttpRequest();
    var params = 'email='+email;
    xmlhttp.open("GET", cfg.authCfg.checkUserEnpoint+"?"+params, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === XMLHttpRequest.DONE) {
           if (xmlhttp.status === 200) {
               var result = xmlhttp.responseText;
               var jsonResult = JSON.parse(result);                       
               helper.hideLoading();
               helper.hideError();               
               var queryString = helper.parseQueryString(window.location.href);
               var appName = null;
        if (queryString.hasOwnProperty("app_name")) {
            appName = queryString.app_name;
        }
        else {
            appName = cfg.backendCfg.defaultClient;
        }
                if (jsonResult.tenantId && appName) {
                    helper.showLoading();
                    var tenant = new XMLHttpRequest();
                    var tenantParams = 'userPoolId='+jsonResult.userPoolId+"&clientName="+appName;
                    tenant.open("GET", cfg.authCfg.getUserPoolEnpoint+"?"+tenantParams, true);
                    tenant.onreadystatechange = function() {
                        if (tenant.readyState === XMLHttpRequest.DONE) {
                           if (tenant.status === 200) {
                               var tenantResult = tenant.responseText;
                               var tenantJsonResult = JSON.parse(tenantResult);                       
                               helper.hideLoading();
                               helper.hideError();
                                var identityProvider = jsonResult.identityProviderName;                                
                                if (identityProvider === "COGNITO") {
                                	var clientId = tenantJsonResult.clientId;
                                    var userPoolId = tenantJsonResult.userPoolId;
                                    var user = jsonResult.email;
                                    initChangePassword(clientId,userPoolId,user);
                                }
                                
                           }
                           else {
                            helper.hideLoading();
                            helper.showError(i18n.userNotFound+"<div class='portal-error-details'>"+i18n.userCaseSensitive+"</div>",$("#signInPasswordInput"));
                           }
                        }
                    };                    
                    tenant.send(tenantParams);
                }
           }
           else {
            helper.hideLoading();
            helper.showError(i18n.userNotFound+"<div class='portal-error-details'>"+i18n.userCaseSensitive+"</div>",$("#signInPasswordInput"));
           }
        }
    };                    
    xmlhttp.send(params);
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
        	var queryString = helper.parseQueryString(window.location.href);
            var appName = null;
        if (queryString.hasOwnProperty("app_name")) {
            appName = queryString.app_name;
        }
        else {
            appName = cfg.backendCfg.defaultClient;
        }
        	var returnTo = queryString.return_to;
            helper.setCookie(cfg.authCfg.awsCookieName,data.getIdToken().getJwtToken(),30);
            helper.setCookie(cfg.authCfg.awsRefreshCookieName,data.getRefreshToken().token,30);            
            if (returnTo) {
            	window.location.href = returnTo;
            }
            else {
                if (queryString.app_root) {
                    callbackUrl = queryString.app_root;
                }
                window.location.href = callbackUrl+"?access_token="+data.getAccessToken().getJwtToken()+"&refresh_token="+data.getRefreshToken().token+"&lang="+queryString.lang+"&app_name="+appName;
            }
            helper.hideLoading();
        })
        .catch(err => {
        	var message = err.message;
            helper.hideLoading();
            if (message) {
                helper.showError(message);
            }
        });
	}
	
	try {
        const user = await Auth.signIn(data.user, data.password);
        // The user has to change it's password
        if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {        	
        	helper.hideLoading();
            if (!changePass) {
                $(".second-step").css({
                   display: "none" 
                });
                $(".third-step").css({
                   display: "block" 
                });                        
                $(".third-step input[name='clientId']").val(helper.sanitize($(".second-step input[name='clientId']").val()));
                $(".third-step input[name='userPoolId']").val(helper.sanitize($(".second-step input[name='userPoolId']").val()));
                $(".third-step input[name='user']").val(helper.sanitize($(".second-step input[name='user']").val()));
                $(".third-step input[name='password']").val(helper.sanitize($(".second-step input[name='password']").val()));
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
                    helper.hideLoading();
                    if (message) {
                        helper.showError(message);
                    }
                });
            }            
        } else {
            // The user directly signs in
        	onUserrSignInSuccess();
        }
    } catch (err) {
    	var message = err.message;
        helper.hideLoading();
        if (message) {
            helper.showError(message,$("#signInPasswordInput"));
        }
    }
}


    $(".change-password-form > form").on('submit',function(e) {
        e.preventDefault();
        validateChangePassword();
    });
    
    $(".first-step form").on("submit", function(e) {
        e.preventDefault();    
        var data =  $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {}); 
        var email = data.email;
        if (email !== "") {
            helper.showLoading();
            var xmlhttp = new XMLHttpRequest();
            var params = 'email='+email;
            xmlhttp.open("GET", cfg.authCfg.checkUserEnpoint+"?"+params, true);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                   if (xmlhttp.status === 200) {
                       var result = xmlhttp.responseText;
                       var jsonResult = JSON.parse(result); 
                       var queryString = helper.parseQueryString(window.location.href);
                       var userId = jsonResult.id;
                       if (userId) {
                            helper.showLoading();
                            var tenantsPool = new XMLHttpRequest();                            
                            tenantsPool.open("GET", cfg.authCfg.tenantsPoolEndpoint+"/"+userId+"/tenants-pool", true);
                            tenantsPool.onreadystatechange = function() {
                                if (tenantsPool.readyState === XMLHttpRequest.DONE) {
                                    if (tenantsPool.status === 200) {
                                        var showTenant = false;
                                        helper.hideLoading();
                                        var tenantsPoolResult = tenantsPool.responseText;
                                        var tenantsObject = JSON.parse(tenantsPoolResult); 
                                        if (tenantsObject.length > 1) {
                                            showTenant = true;
                                        }
                                        else {
                                            showTenant = false;
                                        }
                                        if (showTenant) {                                            
                                            var buildTenantsCombo = function(obj) {
                                                var options = [];
                                                var valueMap = "userPoolId";
                                                var textMap = "tenantName";
                                                $(obj).each(function(i,v) {
                                                    options.push('<option value="'+v[valueMap]+'" data-identityProviderName="'+v["identityProviderName"]+'">'+v[textMap]+'</option>');
                                                });
                                                var select = ['<select name="tenantSelectCombo" id="tenantSelectCombo">',
                                                options.join(""),
                                                '</select>'].join("");
                                                return select;
                                            };
                                            $(".first-step").css({
                                                display: "none" 
                                            });
                                            $(".tenant-select-step").css({
                                                display: "block" 
                                            });
                                            $(".tenant-select-step h3").html(jsonResult.email);
                                            $(".tenant-select-step input[name='email']").val(helper.sanitize(jsonResult.email));
                                            $(".tenant-select-step input[name='user']").val(helper.sanitize(jsonResult.email));
                                            $(".tenant-select-step input[name='identityProviderName']").val(helper.sanitize(tenantsObject[0].identityProviderName));
                                            $(".tenant-select-step .tenants-combo-container").html(buildTenantsCombo(tenantsObject));
                                            $("#signInEmailInput").val(""); 
                                        }
                                        else {
                                            tenantsObject = tenantsObject[0];
                                            var appName = queryString.app_name;
                                            if (!queryString.app_name) {
                                                appName = cfg.backendCfg.defaultClient;
                                            }
                                            if (tenantsObject.tenantId && appName) {
                                                helper.showLoading();
                                                var tenant = new XMLHttpRequest(); 
                                                // TO DO: remove hardcoded cfg.authCfg.appName
                                                var tenantParams = 'userPoolId='+tenantsObject.userPoolId+"&clientName="+appName;
                                                tenant.open("GET", cfg.authCfg.getUserPoolEnpoint+"?"+tenantParams, true);
                                                tenant.onreadystatechange = function() {
                                                    if (tenant.readyState === XMLHttpRequest.DONE) {
                                                        if (tenant.status === 200) {
                                                            var tenantResult = tenant.responseText;
                                                            var tenantJsonResult = JSON.parse(tenantResult); 
                                                            localStorage.setItem('loggedIntenantData', JSON.stringify(tenantJsonResult));                      
                                                            helper.hideLoading();
                                                            helper.hideError();
                                                            $(".second-step input[name='clientId']").val(helper.sanitize(tenantJsonResult.clientId));
                                                            $(".second-step input[name='userPoolId']").val(helper.sanitize(tenantJsonResult.userPoolId));
                                                            callbackUrl = tenantJsonResult.callbackUrl;                                                            
                                                            var identityProvider = jsonResult.identityProviderName;                                                            
                                                            if (identityProvider && identityProvider !== "COGNITO") {
                                                                var domain = tenantJsonResult.domainUrl;
                                                                var appId = tenantJsonResult.clientId;
                                                                var redirectUrl = tenantJsonResult.callbackUrl;  
                                                                helper.showLoading();
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
                                                                $(".second-step input[name='email']").val(helper.sanitize(jsonResult.email));
                                                                $(".second-step input[name='user']").val(helper.sanitize(jsonResult.email));
                                                            }
                                                            $("#signInEmailInput").val("");                                                             
                                                        }
                                                        else {
                                                            helper.hideLoading();
                                                            helper.showError(i18n.userNotFound+"<div class='portal-error-details'>"+i18n.userCaseSensitive+"</div>",$("#signInEmailInput"));
                                                            $("#signInEmailInput").val(""); 
                                                        }
                                                    }
                                                };                    
                                                tenant.send(tenantParams);
                                            }
                                        }
                                    helper.hideLoading();
                                    helper.hideError();
                                    }
                                    else {
                                        var tenantsPoolErrorResponse = JSON.parse(tenantsPool.responseText);
                                        helper.hideLoading();
                                        helper.showError(tenantsPoolErrorResponse.message);
                                    }
                                }
                            }
                            tenantsPool.send();
                       }
                   }
                   else {
                    helper.hideLoading();
                    helper.showError(i18n.userNotFound+"<div class='portal-error-details'>"+i18n.userCaseSensitive+"</div>",$("#signInEmailInput"));
                   }
                }
            };                    
            xmlhttp.send(params);
        }
        else {
            helper.showError(i18n.findByEmail,$("#signInEmailInput"));
        }
    });

    $(".form-group input, .form-group select").on("focus", function() {
        helper.hideAttachedError($(this));
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
            helper.hideError();
            helper.showLoading();
            return auth(data);
        }
        else {
            helper.showError(i18n.enterpassword,$("#signInPasswordInput"));
        }
    });

    $(".tenant-select-step form").on("submit", function(e) {
        e.preventDefault();    
        var data =  $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {}); 
                       
        var queryString = helper.parseQueryString(window.location.href);
        helper.showLoading();
        var tenant = new XMLHttpRequest(); 
        var appName = null;
        if (queryString.hasOwnProperty("app_name")) {
            appName = queryString.app_name;
        }
        else {
            appName = cfg.backendCfg.defaultClient;
        }
        var tenantParams = 'userPoolId='+data.tenantSelectCombo+"&clientName="+appName;
        tenant.open("GET", cfg.authCfg.getUserPoolEnpoint+"?"+tenantParams, true);
        tenant.onreadystatechange = function() {
            if (tenant.readyState === XMLHttpRequest.DONE) {
                if (tenant.status === 200) {
                    var tenantResult = tenant.responseText;
                    var tenantJsonResult = JSON.parse(tenantResult); 
                    localStorage.setItem('loggedIntenantData', JSON.stringify(tenantJsonResult));                      
                    helper.hideLoading();
                    helper.hideError();                    
                    $(".second-step input[name='clientId']").val(helper.sanitize(tenantJsonResult.clientId));
                    $(".second-step input[name='userPoolId']").val(helper.sanitize(tenantJsonResult.userPoolId));
                    callbackUrl = tenantJsonResult.callbackUrl;                                                            
                    var identityProvider = identityProvider = data.identityProviderName;                                               
                    if (identityProvider && identityProvider !== "COGNITO") {
                        console.log(1);
                        var domain = tenantJsonResult.domainUrl;
                        var appId = tenantJsonResult.clientId;
                        var redirectUrl = tenantJsonResult.callbackUrl;  
                        helper.showLoading();
                        var url = "https://"+domain+"/oauth2/authorize?identity_provider="+identityProvider+"&redirect_uri="+redirectUrl+"&response_type=CODE&client_id="+appId+"&state=STATE&scope=openid+profile+aws.cognito.signin.user.admin";
                        window.location.href = url;
                    }
                    else {
                        console.log(12);
                        $(".tenant-select-step").css({
                            display: "none" 
                        });
                        $(".second-step").css({
                            display: "block" 
                        });
                        $(".second-step h3").html(data.user);
                        $(".second-step input[name='password']").focus();
                        $(".second-step input[name='email']").val(helper.sanitize(data.user));
                        $(".second-step input[name='user']").val(helper.sanitize(data.user));
                    }
                    $("#signInEmailInput").val("");                                                             
                }
                else {                    
                    helper.hideLoading();
                    helper.hideError();  
                    var result = tenant.responseText;
                    var jsonResult = JSON.parse(result);
                    helper.showError(jsonResult.message);
                }
            }
        };                    
        tenant.send(tenantParams);
    });

    $(".back-to-first-step").on("click", function(e) {
        e.preventDefault();       
        helper.hideError();
        $(".first-step").css({
           display: "block" 
        });
        $(".second-step").css({
           display: "none" 
        });
        $(".tenant-select-step").css({
           display: "none" 
        });
    });

    $(".back-to-second-step").on("click", function(e) {
        e.preventDefault();  
        helper.hideError();
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
        shrinkLogo();

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
        var tenantStep = $(".tenant-select-step");
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
         tenantStep.css({
            display: "none" 
         });
         helper.hideError();
         helper.clearPasswordForm();
         expandLogo();
    });

    $(".registration-form form").find('input,button').focus(function() {
        helper.hideError();
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
                name : data.firstName+" "+data.lastName
            }
            var payloadString = payLoad;            
            var params = JSON.stringify(payloadString);
            var xmlhttp = new XMLHttpRequest();
            helper.showLoading(); 
            xmlhttp.open("POST", cfg.authCfg.registerEndpoint, true);
            xmlhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState === XMLHttpRequest.DONE) {
                   if (xmlhttp.status === 200) {
                    helper.hideLoading();
                        registrationForm.css({
                           display: "none" 
                        });
                        confirmationForm.css({
                           display: "block" 
                        });
                        shrinkLogo();
        
                   }
                   else {
                       if (xmlhttp.status === 409) {
                           var result = xmlhttp.responseText;
                           var jsonResult = JSON.parse(result);
                           helper.showError(jsonResult.message);
                       }
                       else {
                        helper.showError(i18n.signupError);
                       }                       
                       helper.hideLoading();
                   }
                }
            };                    
            xmlhttp.send(params);            
        }
        else {
            if (!helper.isEmail($('#registration_email').val()) && formValid === true) {
                helper.showError(i18n.invalidEmail);
            }
            else {
                if (emailExists === false || formValid === false) {
                    helper.showError(i18n.fillFields);
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
            helper.showError(i18n.passwordsDoNotMatch);
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
            if ($('#registration_email').val() !== "" && helper.isEmail($('#registration_email').val())) {
                helper.hideError();
                emailExists = false;
                helper.showLoading();                
                var xmlhttp = new XMLHttpRequest();
                var params = "email="+$('#registration_email').val();
                xmlhttp.open("GET", cfg.authCfg.checkEmailEndpoint+"?"+params, true);
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
                            helper.hideLoading();
                       }
                       else {
                        helper.hideLoading();
                       }
                    }
                };                    
                xmlhttp.send();
            }
            if ($('#registration_email').val() !== "" && !helper.isEmail($('#registration_email').val())) {
                emailExists = true;
            }
        }
    });


$(document).ready(function() {
    helper.initTranslate();

    $('body').on('change','#tenantSelectCombo',function() {
        console.log("ok");
        var $option = $(this).find('option:selected');
        var identityProviderName = $('#identityProviderName');
        identityProviderName.val($option.attr('data-identityProviderName'));
        console.log($option.attr('data-identityProviderName'));
    });

});