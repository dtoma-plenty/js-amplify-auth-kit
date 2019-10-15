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
/******/ 	return __webpack_require__(__webpack_require__.s = "./private/kit.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/jwt-decode/lib/atob.js":
/*!*********************************************!*\
  !*** ./node_modules/jwt-decode/lib/atob.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n * The code was extracted from:\n * https://github.com/davidchambers/Base64.js\n */\n\nvar chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';\n\nfunction InvalidCharacterError(message) {\n  this.message = message;\n}\n\nInvalidCharacterError.prototype = new Error();\nInvalidCharacterError.prototype.name = 'InvalidCharacterError';\n\nfunction polyfill (input) {\n  var str = String(input).replace(/=+$/, '');\n  if (str.length % 4 == 1) {\n    throw new InvalidCharacterError(\"'atob' failed: The string to be decoded is not correctly encoded.\");\n  }\n  for (\n    // initialize result and counters\n    var bc = 0, bs, buffer, idx = 0, output = '';\n    // get next character\n    buffer = str.charAt(idx++);\n    // character found in table? initialize bit storage and add its ascii value;\n    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,\n      // and if not first of each 4 characters,\n      // convert the first 8 bits to one ascii character\n      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0\n  ) {\n    // try to find character in table (0-63, not found => -1)\n    buffer = chars.indexOf(buffer);\n  }\n  return output;\n}\n\n\nmodule.exports = typeof window !== 'undefined' && window.atob && window.atob.bind(window) || polyfill;\n\n\n//# sourceURL=webpack:///./node_modules/jwt-decode/lib/atob.js?");

/***/ }),

/***/ "./node_modules/jwt-decode/lib/base64_url_decode.js":
/*!**********************************************************!*\
  !*** ./node_modules/jwt-decode/lib/base64_url_decode.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var atob = __webpack_require__(/*! ./atob */ \"./node_modules/jwt-decode/lib/atob.js\");\n\nfunction b64DecodeUnicode(str) {\n  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {\n    var code = p.charCodeAt(0).toString(16).toUpperCase();\n    if (code.length < 2) {\n      code = '0' + code;\n    }\n    return '%' + code;\n  }));\n}\n\nmodule.exports = function(str) {\n  var output = str.replace(/-/g, \"+\").replace(/_/g, \"/\");\n  switch (output.length % 4) {\n    case 0:\n      break;\n    case 2:\n      output += \"==\";\n      break;\n    case 3:\n      output += \"=\";\n      break;\n    default:\n      throw \"Illegal base64url string!\";\n  }\n\n  try{\n    return b64DecodeUnicode(output);\n  } catch (err) {\n    return atob(output);\n  }\n};\n\n\n//# sourceURL=webpack:///./node_modules/jwt-decode/lib/base64_url_decode.js?");

/***/ }),

/***/ "./node_modules/jwt-decode/lib/index.js":
/*!**********************************************!*\
  !*** ./node_modules/jwt-decode/lib/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar base64_url_decode = __webpack_require__(/*! ./base64_url_decode */ \"./node_modules/jwt-decode/lib/base64_url_decode.js\");\n\nfunction InvalidTokenError(message) {\n  this.message = message;\n}\n\nInvalidTokenError.prototype = new Error();\nInvalidTokenError.prototype.name = 'InvalidTokenError';\n\nmodule.exports = function (token,options) {\n  if (typeof token !== 'string') {\n    throw new InvalidTokenError('Invalid token specified');\n  }\n\n  options = options || {};\n  var pos = options.header === true ? 0 : 1;\n  try {\n    return JSON.parse(base64_url_decode(token.split('.')[pos]));\n  } catch (e) {\n    throw new InvalidTokenError('Invalid token specified: ' + e.message);\n  }\n};\n\nmodule.exports.InvalidTokenError = InvalidTokenError;\n\n\n//# sourceURL=webpack:///./node_modules/jwt-decode/lib/index.js?");

/***/ }),

/***/ "./private/config.js":
/*!***************************!*\
  !*** ./private/config.js ***!
  \***************************/
/*! exports provided: backendCfg, authCfg */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"backendCfg\", function() { return backendCfg; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"authCfg\", function() { return authCfg; });\nvar backendCfg = {\r\n    domain : \"https://api-gateway-features.fuelplus.com\",\r\n    defaultClient: \"portal-one-web-dev\"\r\n}\r\n\r\nvar authCfg = {\r\n        awsCookieName : \"_fpAuth\",\r\n        awsRefreshCookieName : \"_fpRefresh\",\r\n        pageLength: 30,\r\n        langCookieName: \"_fpLanguage\",\r\n        checkUserEnpoint: backendCfg.domain+\"/user-management-service/api/users/findByEmail\",\r\n        getUserPoolEnpoint: backendCfg.domain+\"/provisioning-service/api/identity-provider/getUserPoolClient\",\r\n        registerEndpoint: backendCfg.domain+\"/tenant-registration-service/api/register\",\r\n        checkEmailEndpoint: backendCfg.domain+\"/user-management-service/api/users/existsByEmail\",\r\n        tokenCheckInterval: 30000,\r\n        tenantsPoolEndpoint: backendCfg.domain+\"/user-management-service/api/users/\",\r\n}\n\n//# sourceURL=webpack:///./private/config.js?");

/***/ }),

/***/ "./private/helpers.js":
/*!****************************!*\
  !*** ./private/helpers.js ***!
  \****************************/
/*! exports provided: sanitize, capitalizeFirstLetter, showLoading, hideLoading, showError, hideAttachedError, hideError, root, get, set, timeConverter, setCookie, clearPasswordForm, getCookie, parseJwt, parseJwtAndReturnHeader, parseQueryString, eraseCookie, isEmail, initTranslate, translateHtml */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"sanitize\", function() { return sanitize; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"capitalizeFirstLetter\", function() { return capitalizeFirstLetter; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"showLoading\", function() { return showLoading; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"hideLoading\", function() { return hideLoading; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"showError\", function() { return showError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"hideAttachedError\", function() { return hideAttachedError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"hideError\", function() { return hideError; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"root\", function() { return root; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"get\", function() { return get; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"set\", function() { return set; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"timeConverter\", function() { return timeConverter; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"setCookie\", function() { return setCookie; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"clearPasswordForm\", function() { return clearPasswordForm; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getCookie\", function() { return getCookie; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseJwt\", function() { return parseJwt; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseJwtAndReturnHeader\", function() { return parseJwtAndReturnHeader; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"parseQueryString\", function() { return parseQueryString; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"eraseCookie\", function() { return eraseCookie; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"isEmail\", function() { return isEmail; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"initTranslate\", function() { return initTranslate; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"translateHtml\", function() { return translateHtml; });\n/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config.js */ \"./private/config.js\");\n/* harmony import */ var jwt_decode__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jwt-decode */ \"./node_modules/jwt-decode/lib/index.js\");\n/* harmony import */ var jwt_decode__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jwt_decode__WEBPACK_IMPORTED_MODULE_1__);\n\n\n\n\nfunction sanitize(payload) {\n\tvar output;\n\tif (payload && !Number.isInteger(payload)) {\n\t\toutput = payload.replace(/<(|\\/|[^>\\/bi]|\\/[^>bi]|[^\\/>][^>]+|\\/[^>][^>]+)>/g, '');\t\n\t}\n\telse {\n\t\t\n\t\toutput = payload;\n\t}\n\treturn output;\n}\n\nfunction capitalizeFirstLetter(string) {\n    return string.charAt(0).toUpperCase() + string.slice(1);\n}\n\nfunction showLoading(hideSpinner) {\n\tif (hideSpinner && hideSpinner === true) {\n\t    $(\".ajax-loading-wrapper\").addClass(\"ajax-loading-wrapper-visible\").addClass(\"ajax-no-spinner\");\t\t\n\t}\n\telse {\n\t\t$(\".ajax-loading-wrapper\").addClass(\"ajax-loading-wrapper-visible\");\n\t}\n}\n\nfunction hideLoading() {\n    $(\".ajax-loading-wrapper\").removeClass(\"ajax-loading-wrapper-visible\").removeClass(\"ajax-no-spinner\");\n}\n\nfunction showError(msg,attachToField) { \n\tif (!attachToField) {\n\t    $(\".error-container\").each(function() {\n\t         $(this).html(msg);\n\t        $(this).css({\n\t           display: \"block\" \n\t        });\n\t    });\t\t\n\t}\n\telse {\n    \n    if (!attachToField.parents(\".form-group\").parents('.field-has-error').length) {\n      attachToField.parents(\".form-group\").find(\".field-error-msg\").remove();\n      attachToField.parents(\".form-group\").wrap('<div class=\"field-has-error\"></div>');\n      attachToField.parents(\".form-group\").append('<div class=\"field-error-msg\">'+msg+'</div>');\n\n    }\n\t}\n}\nfunction hideAttachedError(field) {\n  field.parents(\".form-group\").find(\".field-error-msg\").remove();\n  if (field.parents(\".form-group\").parents('.field-has-error').length) {\n    field.parents(\".form-group\").unwrap();\n  }\n}\nfunction hideError() {\n    $(\".error-container\").each(function() {\n        $(this).html(\"\");\n        $(this).css({\n           display: \"none\" \n        });\n    });\n}\n\nfunction root() {\n\n    function NestedSetterAndGetter(){\n      function setValueByArray(obj, parts, value){\n  \n        if(!parts){\n          throw 'No parts array passed in';\n        }\n  \n        if(parts.length === 0){\n          throw 'parts should never have a length of 0';\n        }\n  \n        if(parts.length === 1){\n          obj[parts[0]] = value;\n        } else {\n          var next = parts.shift();\n  \n          if(!obj[next]){\n            obj[next] = {};\n          }\n          setValueByArray(obj[next], parts, value);\n        }\n      }\n  \n      function getValueByArray(obj, parts, value){\n  \n        if(!parts) {\n          return null;\n        }\n  \n        if(parts.length === 1){\n          return obj[parts[0]];\n        } else {\n          var next = parts.shift();\n  \n          if(!obj[next]){\n            return null;\n          }\n          return getValueByArray(obj[next], parts, value);\n        }\n      }\n  \n      this.set = function(obj, path, value) {\n        setValueByArray(obj, path.split('.'), value);\n      };\n  \n      this.get = function(obj, path){\n        return getValueByArray(obj, path.split('.'));\n      };\n  \n    }\n    root.NestedSetterAndGetter = NestedSetterAndGetter;\n  \n  }\n\nfunction get(obj, key) {\n    var setter = new NestedSetterAndGetter();\n    return setter.get(obj, key) ? setter.get(obj, key) : \"\";\n}\n\nfunction set(obj, key,value) {\n    var setter = new NestedSetterAndGetter();\n    return setter.set(obj, key,value);\n}\n\nfunction timeConverter(UNIX_timestamp){\n  var a = new Date(UNIX_timestamp * 1000);\n  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];\n  var year = a.getFullYear();\n  var month = months[a.getMonth()];\n  var date = a.getDate();\n  var hour = a.getHours();\n  var min = a.getMinutes();\n  var sec = a.getSeconds();\n  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;\n  return time;\n}\n\nfunction setCookie(name,value,days) {\n  var expires = \"\";\n  if (days) {\n      var date = new Date();\n      date.setTime(date.getTime() + (days*24*60*60*1000));\n      expires = \"; expires=\" + date.toUTCString();\n  }\n  document.cookie = name + \"=\" + (value || \"\")  + expires + \"; path=/\";\n}\n\nfunction clearPasswordForm() {\n\tvar i1 = $(\"#change_verification_code\");\n\tvar i2 = $(\"#change_password\"); \n\tvar i3 = $(\"#change_repeat_password\");\n\tvar i4 = $(\"#forgot_pass_email\");\n\ti1.val(\"\");\n\ti2.val(\"\");\n\ti3.val(\"\");\n\ti4.val(\"\");\n}\n\nfunction getCookie(name) {\n  var nameEQ = name + \"=\";\n  var ca = document.cookie.split(';');\n  for(var i=0;i < ca.length;i++) {\n      var c = ca[i];\n      while (c.charAt(0)===' ') c = c.substring(1,c.length);\n      if (c.indexOf(nameEQ) !== -1) return c.substring(nameEQ.length,c.length);\n  }\n  return null;\n}\n\nfunction parseJwt (token) {\n    try {\n    \treturn jwt_decode__WEBPACK_IMPORTED_MODULE_1___default()(token);\n    }\n    catch(err) {\n      window.location.href=fpPortalConfig.loginEndpoint+\"?lang=\"+fpPortalConfig.appLang+\"&app_name=\"+fpPortalConfig.appName+\"&app_root=\"+window.location.href\n    }\n}\n\nfunction parseJwtAndReturnHeader (token) {\n\ttry {\n    \treturn jwt_decode__WEBPACK_IMPORTED_MODULE_1___default()(token);\n    }\n    catch(err) {\n      window.location.href=fpPortalConfig.loginEndpoint+\"?lang=\"+fpPortalConfig.appLang+\"&app_name=\"+fpPortalConfig.appName+\"&app_root=\"+window.location.href\n    }\n    \n}\n\nfunction parseQueryString(url) {\n  var urlParams = {};\n  url.replace(\n    new RegExp(\"([^?=&]+)(=([^&]*))?\", \"g\"),\n    function($0, $1, $2, $3) {\n      urlParams[$1] = $3;\n    }\n  );\n  \n  return urlParams;\n}\n\nfunction eraseCookie(name) {   \n    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';\n}\n\n\nfunction isEmail(email) {\n  var regex = /^([a-zA-Z0-9_.+-])+\\@(([a-zA-Z0-9-])+\\.)+([a-zA-Z0-9]{2,4})+$/;\n  return regex.test(email);\n}\n\nfunction initTranslate() {    \n    var langCookie = getCookie(_config_js__WEBPACK_IMPORTED_MODULE_0__[\"authCfg\"].langCookieName);\n    if (langCookie) {\n        $.getScript(\"js/public/i18n/\"+langCookie+\"/translations.js\", function(){\n            translateHtml();\n        });\n    }\n    else {\n        $.getScript(\"js/public/i18n/en/translations.js\", function(){\n            translateHtml();\n        });\n    }\n}\n\nfunction translateHtml() {\n    $(\"*[data-i18n]\").each( function() {\n        $(this).html(i18n[$(this).attr(\"data-i18n\")]);\n    });\n}\n\n\n//# sourceURL=webpack:///./private/helpers.js?");

/***/ }),

/***/ "./private/kit.js":
/*!************************!*\
  !*** ./private/kit.js ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers.js */ \"./private/helpers.js\");\n/* harmony import */ var _config_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config.js */ \"./private/config.js\");\n\r\n\r\n\r\n// Auth functions\r\n\r\nvar ts = Math.round((new Date()).getTime() / 1000);\r\nvar refreshToken = null;\r\n\r\nfunction isAuthenticated() { \r\n    var queryString = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseQueryString\"](window.location.href);\r\n\tvar access_token = queryString.access_token;\r\n\tvar refresh_token = queryString.refresh_token;\r\n    var result = false;\r\n\tvar token = access_token;\r\n\r\n\t// Auth token logic\r\n\r\n\tconsole.log(fpPortalConfig.awsCookieName);\r\nconsole.log(_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"getCookie\"](fpPortalConfig.awsCookieName));\r\n\r\n    if (access_token) {\r\n        _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](fpPortalConfig.awsCookieName);\r\n\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"setCookie\"](fpPortalConfig.awsCookieName,access_token,30);\r\n\t\ttoken = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"getCookie\"](fpPortalConfig.awsCookieName);\r\n    }\r\n\r\n\tvar tokenObj = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseJwt\"](token);\r\n\tif (token && typeof(token) !== \"undefined\") {\r\n\t\tvar tokenObj = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseJwt\"](token);\r\n\t\tvar tokenExp = tokenObj.exp;\r\n\t\tvar userPoolId = tokenObj.iss.split(/[/ ]+/).pop();\r\n\t\tvar clientName = queryString.app_name;\r\n\r\n\t\t// If the token isn't expired\r\n\t\tif (ts <= tokenExp) {\r\n\t\t\tresult = true;\r\n\t\t}\r\n\t\telse {\r\n\t\t\t// If the access token is present but expired get a new access token\r\n\t\t\t\r\n\t\t\tvar params = '?refreshToken='+refresh_token+'&userPoolId='+userPoolId+'&clientName='+clientName;\r\n\t\t\t$.ajax({\r\n\t\t\t\turl: fpPortalConfig.refreshEndpoint+params,\r\n\t\t\t\ttype: 'GET',\r\n\t\t\t\tsuccess: function(res) {\r\n\t\t\t\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](fpPortalConfig.awsCookieName);\r\n\t\t\t\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"setCookie\"](fpPortalConfig.awsCookieName,res.idToken,30);\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t\t// After getting the new access token call the isAuthenticated \r\n\t\t\t\t\t\t// function again to trigger the expiration time verification\r\n\t\t\t\t\t\t\r\n\t\t\t\t\t\tonAuthenticated();\r\n\t\t\t\t},\r\n\t\t\t\terror: function() {\r\n\t\t\t\t\t\twindow.location.href=fpPortalConfig.logoutEndpoint;\r\n\t\t\t\t}\r\n\t\t\t});\r\n\t\t\t\r\n\t\t}\r\n\t}\r\n    return result;\r\n}\r\n\r\nfunction onAuthenticated() {\r\n\r\n\tvar queryString = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseQueryString\"](window.location.href);\r\n\tvar lang = queryString.lang;\r\n\tif (lang) {\r\n\t\tlang = queryString.lang.replace(\"#\", \"\");\r\n\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](_config_js__WEBPACK_IMPORTED_MODULE_1__[\"authCfg\"].langCookieName);\r\n\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"setCookie\"](_config_js__WEBPACK_IMPORTED_MODULE_1__[\"authCfg\"].langCookieName,lang,30);\r\n\t}\r\n\r\n    var token = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"getCookie\"](_config_js__WEBPACK_IMPORTED_MODULE_1__[\"authCfg\"].awsCookieName);\r\n    var tokenObj = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseJwt\"](token);\r\n    $(\"body\").animate({\r\n        opacity: 1\r\n    });\r\n}\r\n\r\nfunction checkAuth() {\t\r\n\tif (isAuthenticated() === true) { \r\n        onAuthenticated();\r\n    }\r\n    else { \r\n\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](_config_js__WEBPACK_IMPORTED_MODULE_1__[\"authCfg\"].awsCookieName);\r\n\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](_config_js__WEBPACK_IMPORTED_MODULE_1__[\"authCfg\"].awsRefreshCookieName);\r\n\t\t// window.location.href=fpPortalConfig.ssoEndpoint;\r\n\t\twindow.location.href=fpPortalConfig.loginEndpoint+\"?lang=\"+fpPortalConfig.appLang+\"&app_name=\"+fpPortalConfig.appName+\"&app_root=\"+window.location.href;\r\n        // doLogout();   \r\n    }\r\n\t\r\n}\r\n\r\nfunction doLogout() {\r\n    _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](_config_js__WEBPACK_IMPORTED_MODULE_1__[\"authCfg\"].awsCookieName);\r\n    _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](_config_js__WEBPACK_IMPORTED_MODULE_1__[\"authCfg\"].awsRefreshCookieName);\r\n    window.location.href=fpPortalConfig.logoutEndpoint;\r\n}\r\n\r\nfunction checkTokenExpiration() {\r\n\tvar currentTime = Math.round((new Date()).getTime() / 1000);\r\n\tvar currentTimePlusTen = currentTime + 10*60;\r\n\tvar queryString = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseQueryString\"](window.location.href);\r\n\tvar access_token = queryString.access_token.replace('-', '+').replace('_', '/');\r\n\tvar refresh_token = queryString.refresh_token;\r\n    var cookieToken = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"getCookie\"](fpPortalConfig.awsCookieName);\r\n    var token = access_token;\r\n    \r\n    if (cookieToken) {\r\n    \ttoken = cookieToken;\r\n    }\r\n    else {\r\n        _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](fpPortalConfig.awsCookieName);\r\n        _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"setCookie\"](fpPortalConfig.awsCookieName,access_token,30);  \t\r\n    }\r\n\r\n    if (token !== \"null\") {    \t\r\n    \t\r\n    \tvar tokenObj = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseJwt\"](token);\r\n\t\tvar tokenExp = tokenObj.exp;\r\n\t\tvar userPoolId = tokenObj.iss.split(/[/ ]+/).pop();\r\n\t\tvar clientName = queryString.app_name;\r\n\t\t\r\n    \tif (currentTimePlusTen >= tokenExp) {\r\n    \t\t\r\n    \t\t// Token is about to expire within the next ten minutes\r\n    \t\tvar params = '?refreshToken='+refresh_token+'&userPoolId='+userPoolId+'&clientName='+clientName;\r\n\t        $.ajax({\r\n\t            url: fpPortalConfig.refreshEndpoint+params,\r\n\t            type: 'GET',\r\n\t            success: function(res) {\r\n\t\t\t\t\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](fpPortalConfig.awsCookieName);\r\n\t\t\t\t\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"setCookie\"](fpPortalConfig.awsCookieName,res.idToken,30);\r\n\t                   \r\n\t                   // After getting the new access token call the isAuthenticated \r\n\t                   // function again to trigger the expiration time verification\r\n\t                   \r\n\t                   onAuthenticated();\r\n\t            },\r\n\t            error: function() {\r\n\t            \t window.location.href=fpPortalConfig.logoutEndpoint;\r\n\t            }\r\n\t        });\r\n    \t\t\r\n    \t} \r\n    \tconsole.log(\"%c=================================================================\\n [portal.ONE auth kit]: Token will expire at: \"+ _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"timeConverter\"](tokenExp)+\"\\n=================================================================\", \"background: #2b61cd; color: #FFF\");\r\n    }\r\n}\r\n\r\nfunction debugRefresh() {\r\n\tvar currentTime = Math.round((new Date()).getTime() / 1000);\r\n\tvar currentTimePlusTen = currentTime + 10*60;\r\n\tvar queryString = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseQueryString\"](window.location.href);\r\n\tvar access_token = queryString.access_token.replace('-', '+').replace('_', '/');\r\n\tvar refresh_token = queryString.refresh_token;\r\n    var cookieToken = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"getCookie\"](fpPortalConfig.awsCookieName);\r\n    var token = access_token;\r\n    \r\n    if (cookieToken) {\r\n    \ttoken = cookieToken;\r\n    }\r\n    else {\r\n        _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](fpPortalConfig.awsCookieName);\r\n        _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"setCookie\"](fpPortalConfig.awsCookieName,access_token,30);  \t\r\n    }\r\n\r\n    if (token !== \"null\") {    \t\r\n    \t\r\n    \tvar tokenObj = _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"parseJwt\"](token);\r\n\t\tvar tokenExp = tokenObj.exp;\r\n\t\tvar userPoolId = tokenObj.iss.split(/[/ ]+/).pop();\r\n\t\tvar clientName = queryString.app_name;\r\n\t\t\r\n    \tif (currentTimePlusTen <= tokenExp) {\r\n    \t\t\r\n    \t\t// Token is about to expire within the next ten minutes\r\n    \t\tvar params = '?refreshToken='+refresh_token+'&userPoolId='+userPoolId+'&clientName='+clientName;\r\n\t        $.ajax({\r\n\t            url: fpPortalConfig.refreshEndpoint+params,\r\n\t            type: 'GET',\r\n\t            success: function(res) {\r\n\t\t\t\t\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](fpPortalConfig.awsCookieName);\r\n\t\t\t\t\t\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"setCookie\"](fpPortalConfig.awsCookieName,res.idToken,30);\r\n\t                   \r\n\t                   // After getting the new access token call the isAuthenticated \r\n\t                   // function again to trigger the expiration time verification\r\n\t                   \r\n\t                   onAuthenticated();\r\n\t            },\r\n\t            error: function() {\r\n\t            \t window.location.href=fpPortalConfig.logoutEndpoint;\r\n\t            }\r\n\t        });\r\n    \t\t\r\n    \t} \r\n    \tconsole.log(\"%c=================================================================\\n [portal.ONE auth kit]: Token will expire at: \"+ _helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"timeConverter\"](tokenExp)+\"\\n=================================================================\", \"background: #2b61cd; color: #FFF\");\r\n    }\r\n\t\r\n\t\r\n\t\r\n}\r\n\r\n// On AJAX error, if the returned code is 401, than the refresh token has expired and the user ahs to be logged out\r\n\r\n$(document).ajaxError(function(event, jqxhr, settings, thrownError) {\r\n  var status = jqxhr.status;\r\n  if (status === 401) {\r\n\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](fpPortalConfig.awsCookieName);\r\n\t_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"eraseCookie\"](fpPortalConfig.awsRefreshCookieName);\r\n\t    window.location.href=fpPortalConfig.logoutEndpoint;\r\n  }\r\n});\r\n\r\n// Check the access token for expiration. If the token is expiring within the next 10 minutes than trigger the refresh mechanism\r\n\r\n$(document).ready(function() {\r\n\tcheckAuth();\r\n\tsetInterval(function() {\r\n\t\tcheckTokenExpiration();\r\n\t},_config_js__WEBPACK_IMPORTED_MODULE_1__[\"authCfg\"].tokenCheckInterval)\r\n});\r\n\r\n// Append token to all ajax requests in the client\r\n\r\n$.ajaxSetup({\r\n    beforeSend: function (xhr)\r\n    {\r\n\t   xhr.setRequestHeader(\"Authorization\",\"Bearer \"+_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"getCookie\"](fpPortalConfig.awsCookieName)); \r\n\t   xhr.setRequestHeader(\"x-api-lang\",_helpers_js__WEBPACK_IMPORTED_MODULE_0__[\"getCookie\"](fpPortalConfig.langCookieName));       \r\n    }\r\n});\n\n//# sourceURL=webpack:///./private/kit.js?");

/***/ })

/******/ });