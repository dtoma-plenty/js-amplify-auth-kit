/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./private/helpers.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./private/helpers.js":
/*!****************************!*\
  !*** ./private/helpers.js ***!
  \****************************/
/*! exports provided: sanitize, capitalizeFirstLetter, showLoading, hideLoading, showError, hideAttachedError, hideError, root, get, set, timeConverter, setCookie, clearPasswordForm, getCookie, parseJwt, parseJwtAndReturnHeader, parseQueryString, eraseCookie, isEmail, initinitTranslate, translateHtml */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"sanitize\", function() { return sanitize; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"capitalizeFirstLetter\", function() { return capitalizeFirstLetter; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"showLoading\", function() { return showLoading; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"hideLoading\", function() { return hideLoading; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"showError\", function() { return showError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"hideAttachedError\", function() { return hideAttachedError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"hideError\", function() { return hideError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"root\", function() { return root; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"get\", function() { return get; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"set\", function() { return set; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"timeConverter\", function() { return timeConverter; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setCookie\", function() { return setCookie; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"clearPasswordForm\", function() { return clearPasswordForm; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getCookie\", function() { return getCookie; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseJwt\", function() { return parseJwt; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseJwtAndReturnHeader\", function() { return parseJwtAndReturnHeader; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseQueryString\", function() { return parseQueryString; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"eraseCookie\", function() { return eraseCookie; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isEmail\", function() { return isEmail; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"initinitTranslate\", function() { return initinitTranslate; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"translateHtml\", function() { return translateHtml; });\nfunction sanitize(payload) {\n\tvar output;\n\tif (payload && !Number.isInteger(payload)) {\n\t\toutput = payload.replace(/<(|\\/|[^>\\/bi]|\\/[^>bi]|[^\\/>][^>]+|\\/[^>][^>]+)>/g, '');\t\n\t}\n\telse {\n\t\t\n\t\toutput = payload;\n\t}\n\treturn output;\n}\n\nfunction capitalizeFirstLetter(string) {\n    return string.charAt(0).toUpperCase() + string.slice(1);\n}\n\nfunction showLoading(hideSpinner) {\n\tif (hideSpinner && hideSpinner === true) {\n\t    $(\".ajax-loading-wrapper\").addClass(\"ajax-loading-wrapper-visible\").addClass(\"ajax-no-spinner\");\t\t\n\t}\n\telse {\n\t\t$(\".ajax-loading-wrapper\").addClass(\"ajax-loading-wrapper-visible\");\n\t}\n}\n\nfunction hideLoading() {\n    $(\".ajax-loading-wrapper\").removeClass(\"ajax-loading-wrapper-visible\").removeClass(\"ajax-no-spinner\");\n}\n\nfunction showError(msg,attachToField) {    \n\tconsole.log(attachToField);\n\tif (!attachToField) {\n\t    $(\".error-container\").each(function() {\n\t         $(this).html(msg);\n\t        $(this).css({\n\t           display: \"block\" \n\t        });\n\t    });\t\t\n\t}\n\telse {\n\t\tattachToField.parents(\".form-group\").find(\".field-error-msg\").remove();\n\t\tattachToField.parents(\".form-group\").wrap('<div class=\"field-has-error\"></div>');\n\t\tattachToField.parents(\".form-group\").append('<div class=\"field-error-msg\">'+msg+'</div>');\n\t}\n}\nfunction hideAttachedError(field) {\n\tfield.parents(\".form-group\").find(\".field-error-msg\").remove();\n}\nfunction hideError() {\n    $(\".error-container\").each(function() {\n        $(this).html(\"\");\n        $(this).css({\n           display: \"none\" \n        });\n    });\n}\n\nfunction root() {\n\n    function NestedSetterAndGetter(){\n      function setValueByArray(obj, parts, value){\n  \n        if(!parts){\n          throw 'No parts array passed in';\n        }\n  \n        if(parts.length === 0){\n          throw 'parts should never have a length of 0';\n        }\n  \n        if(parts.length === 1){\n          obj[parts[0]] = value;\n        } else {\n          var next = parts.shift();\n  \n          if(!obj[next]){\n            obj[next] = {};\n          }\n          setValueByArray(obj[next], parts, value);\n        }\n      }\n  \n      function getValueByArray(obj, parts, value){\n  \n        if(!parts) {\n          return null;\n        }\n  \n        if(parts.length === 1){\n          return obj[parts[0]];\n        } else {\n          var next = parts.shift();\n  \n          if(!obj[next]){\n            return null;\n          }\n          return getValueByArray(obj[next], parts, value);\n        }\n      }\n  \n      this.set = function(obj, path, value) {\n        setValueByArray(obj, path.split('.'), value);\n      };\n  \n      this.get = function(obj, path){\n        return getValueByArray(obj, path.split('.'));\n      };\n  \n    }\n    root.NestedSetterAndGetter = NestedSetterAndGetter;\n  \n  }\n\nfunction get(obj, key) {\n    var setter = new NestedSetterAndGetter();\n    return setter.get(obj, key) ? setter.get(obj, key) : \"\";\n}\n\nfunction set(obj, key,value) {\n    var setter = new NestedSetterAndGetter();\n    return setter.set(obj, key,value);\n}\n\n\n\nfunction timeConverter(UNIX_timestamp){\n  var a = new Date(UNIX_timestamp * 1000);\n  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];\n  var year = a.getFullYear();\n  var month = months[a.getMonth()];\n  var date = a.getDate();\n  var hour = a.getHours();\n  var min = a.getMinutes();\n  var sec = a.getSeconds();\n  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;\n  return time;\n}\n\nfunction setCookie(name,value,days) {\n  var expires = \"\";\n  if (days) {\n      var date = new Date();\n      date.setTime(date.getTime() + (days*24*60*60*1000));\n      expires = \"; expires=\" + date.toUTCString();\n  }\n  document.cookie = name + \"=\" + (value || \"\")  + expires + \"; path=/\";\n}\n\nfunction clearPasswordForm() {\n\tvar i1 = $(\"#change_verification_code\");\n\tvar i2 = $(\"#change_password\"); \n\tvar i3 = $(\"#change_repeat_password\");\n\tvar i4 = $(\"#forgot_pass_email\");\n\ti1.val(\"\");\n\ti2.val(\"\");\n\ti3.val(\"\");\n\ti4.val(\"\");\n}\n\nfunction getCookie(name) {\n  var nameEQ = name + \"=\";\n  var ca = document.cookie.split(';');\n  for(var i=0;i < ca.length;i++) {\n      var c = ca[i];\n      while (c.charAt(0)===' ') c = c.substring(1,c.length);\n      if (c.indexOf(nameEQ) !== -1) return c.substring(nameEQ.length,c.length);\n  }\n  return null;\n}\n\nfunction parseJwt (token) {\n    try {\n    \treturn jwt_decode(token);\n    }\n    catch(err) {\n    \tconsole.log(err);    \t\n    \talert(\"An error occoured while trying to log you in\");\n    }\n}\n\nfunction parseJwtAndReturnHeader (token) {\n\ttry {\n    \treturn jwt_decode(token);\n    }\n    catch(err) {\n    \tconsole.log(token);\n    \tconsole.log(err);    \t\n    \talert(\"An error occoured while trying to log you in\");\n    }\n    \n}\n\nfunction parseQueryString(url) {\n  var urlParams = {};\n  url.replace(\n    new RegExp(\"([^?=&]+)(=([^&]*))?\", \"g\"),\n    function($0, $1, $2, $3) {\n      urlParams[$1] = $3;\n    }\n  );\n  \n  return urlParams;\n}\n\nfunction eraseCookie(name) {   \n    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';\n}\n\n\nfunction isEmail(email) {\n  var regex = /^([a-zA-Z0-9_.+-])+\\@(([a-zA-Z0-9-])+\\.)+([a-zA-Z0-9]{2,4})+$/;\n  return regex.test(email);\n}\n\nfunction initinitTranslate() {    \n    var langCookie = getCookie(authCfg.langCookieName);\n    if (langCookie) {\n        $.getScript(\"js/public/i18n/\"+langCookie+\"/translations.js\", function(){\n            translateHtml();\n        });\n    }\n    else {\n        $.getScript(\"js/public/i18n/en/translations.js\", function(){\n            translateHtml();\n        });\n    }\n}\n\nfunction translateHtml() {\n    $(\"*[data-i18n]\").each( function() {\n        $(this).html(i18n[$(this).attr(\"data-i18n\")]);\n    });\n}\n\n\n//# sourceURL=webpack:///./private/helpers.js?");

/***/ })

/******/ });