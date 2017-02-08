(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
// Best place to find information on XHR features is:
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

var reqfields = [
  'responseType', 'withCredentials', 'timeout', 'onprogress'
]

// Simple and small ajax function
// Takes a parameters object and a callback function
// Parameters:
//  - url: string, required
//  - headers: object of `{header_name: header_value, ...}`
//  - body:
//      + string (sets content type to 'application/x-www-form-urlencoded' if not set in headers)
//      + FormData (doesn't set content type so that browser will set as appropriate)
//  - method: 'GET', 'POST', etc. Defaults to 'GET' or 'POST' based on body
//  - cors: If your using cross-origin, you will need this true for IE8-9
//
// The following parameters are passed onto the xhr object.
// IMPORTANT NOTE: The caller is responsible for compatibility checking.
//  - responseType: string, various compatability, see xhr docs for enum options
//  - withCredentials: boolean, IE10+, CORS only
//  - timeout: long, ms timeout, IE8+
//  - onprogress: callback, IE10+
//
// Callback function prototype:
//  - statusCode from request
//  - response
//    + if responseType set and supported by browser, this is an object of some type (see docs)
//    + otherwise if request completed, this is the string text of the response
//    + if request is aborted, this is "Abort"
//    + if request times out, this is "Timeout"
//    + if request errors before completing (probably a CORS issue), this is "Error"
//  - request object
//
// Returns the request object. So you can call .abort() or other methods
//
// DEPRECATIONS:
//  - Passing a string instead of the params object has been removed!
//
exports.ajax = function (params, callback) {
  // Any variable used more than once is var'd here because
  // minification will munge the variables whereas it can't munge
  // the object access.
  var headers = params.headers || {}
    , body = params.body
    , method = params.method || (body ? 'POST' : 'GET')
    , called = false

  var req = getRequest(params.cors)

  function cb(statusCode, responseText) {
    return function () {
      if (!called) {
        callback(req.status === undefined ? statusCode : req.status,
                 req.status === 0 ? "Error" : (req.response || req.responseText || responseText),
                 req)
        called = true
      }
    }
  }

  req.open(method, params.url, true)

  var success = req.onload = cb(200)
  req.onreadystatechange = function () {
    if (req.readyState === 4) success()
  }
  req.onerror = cb(null, 'Error')
  req.ontimeout = cb(null, 'Timeout')
  req.onabort = cb(null, 'Abort')

  if (body) {
    setDefault(headers, 'X-Requested-With', 'XMLHttpRequest')

    if (!global.FormData || !(body instanceof global.FormData)) {
      setDefault(headers, 'Content-Type', 'application/x-www-form-urlencoded')
    }
  }

  for (var i = 0, len = reqfields.length, field; i < len; i++) {
    field = reqfields[i]
    if (params[field] !== undefined)
      req[field] = params[field]
  }

  for (var field in headers)
    req.setRequestHeader(field, headers[field])

  req.send(body)

  return req
}

function getRequest(cors) {
  // XDomainRequest is only way to do CORS in IE 8 and 9
  // But XDomainRequest isn't standards-compatible
  // Notably, it doesn't allow cookies to be sent or set by servers
  // IE 10+ is standards-compatible in its XMLHttpRequest
  // but IE 10 can still have an XDomainRequest object, so we don't want to use it
  if (cors && global.XDomainRequest && !/MSIE 1/.test(navigator.userAgent))
    return new XDomainRequest
  if (global.XMLHttpRequest)
    return new XMLHttpRequest
}

function setDefault(obj, key, value) {
  obj[key] = obj[key] || value
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

module.exports = {
    'default': 'RFC3986',
    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

},{}],3:[function(require,module,exports){
'use strict';

var stringify = require('./stringify');
var parse = require('./parse');
var formats = require('./formats');

module.exports = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

},{"./formats":2,"./parse":4,"./stringify":5}],4:[function(require,module,exports){
'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;

var defaults = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    parameterLimit: 1000,
    plainObjects: false,
    strictNullHandling: false
};

var parseValues = function parseValues(str, options) {
    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos));
            val = options.decoder(part.slice(pos + 1));
        }
        if (has.call(obj, key)) {
            obj[key] = [].concat(obj[key]).concat(val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function parseObject(chain, val, options) {
    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj;
    if (root === '[]') {
        obj = [];
        obj = obj.concat(parseObject(chain, val, options));
    } else {
        obj = options.plainObjects ? Object.create(null) : {};
        var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;
        var index = parseInt(cleanRoot, 10);
        if (
            !isNaN(index) &&
            root !== cleanRoot &&
            String(index) === cleanRoot &&
            index >= 0 &&
            (options.parseArrays && index <= options.arrayLimit)
        ) {
            obj = [];
            obj[index] = parseObject(chain, val, options);
        } else {
            obj[cleanRoot] = parseObject(chain, val, options);
        }
    }

    return obj;
};

var parseKeys = function parseKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^\.\[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // Get the parent

    var segment = parent.exec(key);

    // Stash the parent if it exists

    var keys = [];
    if (segment[1]) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, segment[1])) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(segment[1]);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].replace(/\[|\]/g, ''))) {
            if (!options.allowPrototypes) {
                continue;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

module.exports = function (str, opts) {
    var options = opts || {};

    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    options.delimiter = typeof options.delimiter === 'string' || utils.isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils.merge(obj, newObj, options);
    }

    return utils.compact(obj);
};

},{"./utils":6}],5:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var formats = require('./formats');

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        return prefix + '[]';
    },
    indices: function indices(prefix, key) {
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

var defaults = {
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    serializeDate: function serializeDate(date) {
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder ? encoder(prefix) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            return [formatter(encoder(prefix)) + '=' + formatter(encoder(obj))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(stringify(
                obj[key],
                generateArrayPrefix(prefix, key),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter
            ));
        } else {
            values = values.concat(stringify(
                obj[key],
                prefix + (allowDots ? '.' + key : '[' + key + ']'),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter
            ));
        }
    }

    return values;
};

module.exports = function (object, opts) {
    var obj = object;
    var options = opts || {};
    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = encode ? (typeof options.encoder === 'function' ? options.encoder : defaults.encoder) : null;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    if (typeof options.format === 'undefined') {
        options.format = formats.default;
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats.formatters[options.format];
    var objKeys;
    var filter;

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify(
            obj[key],
            key,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encoder,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter
        ));
    }

    return keys.join(delimiter);
};

},{"./formats":2,"./utils":6}],6:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty;

var hexTable = (function () {
    var array = [];
    for (var i = 0; i < 256; ++i) {
        array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
    }

    return array;
}());

exports.arrayToObject = function (source, options) {
    var obj = options && options.plainObjects ? Object.create(null) : {};
    for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== 'undefined') {
            obj[i] = source[i];
        }
    }

    return obj;
};

exports.merge = function (target, source, options) {
    if (!source) {
        return target;
    }

    if (typeof source !== 'object') {
        if (Array.isArray(target)) {
            target.push(source);
        } else if (typeof target === 'object') {
            target[source] = true;
        } else {
            return [target, source];
        }

        return target;
    }

    if (typeof target !== 'object') {
        return [target].concat(source);
    }

    var mergeTarget = target;
    if (Array.isArray(target) && !Array.isArray(source)) {
        mergeTarget = exports.arrayToObject(target, options);
    }

    if (Array.isArray(target) && Array.isArray(source)) {
        source.forEach(function (item, i) {
            if (has.call(target, i)) {
                if (target[i] && typeof target[i] === 'object') {
                    target[i] = exports.merge(target[i], item, options);
                } else {
                    target.push(item);
                }
            } else {
                target[i] = item;
            }
        });
        return target;
    }

    return Object.keys(source).reduce(function (acc, key) {
        var value = source[key];

        if (Object.prototype.hasOwnProperty.call(acc, key)) {
            acc[key] = exports.merge(acc[key], value, options);
        } else {
            acc[key] = value;
        }
        return acc;
    }, mergeTarget);
};

exports.decode = function (str) {
    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

exports.encode = function (str) {
    // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
    // It has been adapted here for stricter adherence to RFC 3986
    if (str.length === 0) {
        return str;
    }

    var string = typeof str === 'string' ? str : String(str);

    var out = '';
    for (var i = 0; i < string.length; ++i) {
        var c = string.charCodeAt(i);

        if (
            c === 0x2D || // -
            c === 0x2E || // .
            c === 0x5F || // _
            c === 0x7E || // ~
            (c >= 0x30 && c <= 0x39) || // 0-9
            (c >= 0x41 && c <= 0x5A) || // a-z
            (c >= 0x61 && c <= 0x7A) // A-Z
        ) {
            out += string.charAt(i);
            continue;
        }

        if (c < 0x80) {
            out = out + hexTable[c];
            continue;
        }

        if (c < 0x800) {
            out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        if (c < 0xD800 || c >= 0xE000) {
            out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
            continue;
        }

        i += 1;
        c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
        out += hexTable[0xF0 | (c >> 18)] + hexTable[0x80 | ((c >> 12) & 0x3F)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)];
    }

    return out;
};

exports.compact = function (obj, references) {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    var refs = references || [];
    var lookup = refs.indexOf(obj);
    if (lookup !== -1) {
        return refs[lookup];
    }

    refs.push(obj);

    if (Array.isArray(obj)) {
        var compacted = [];

        for (var i = 0; i < obj.length; ++i) {
            if (obj[i] && typeof obj[i] === 'object') {
                compacted.push(exports.compact(obj[i], refs));
            } else if (typeof obj[i] !== 'undefined') {
                compacted.push(obj[i]);
            }
        }

        return compacted;
    }

    var keys = Object.keys(obj);
    keys.forEach(function (key) {
        obj[key] = exports.compact(obj[key], refs);
    });

    return obj;
};

exports.isRegExp = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
};

exports.isBuffer = function (obj) {
    if (obj === null || typeof obj === 'undefined') {
        return false;
    }

    return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global document, confirm, $ */

var usersList = {
  init: function init() {
    var scope = document.querySelector('.user-list');
    if (scope != null) {
      this._ajax = _nanoajax2.default.ajax;

      this._scope = scope;
      this._table = this._scope.querySelector('#filtered-list tbody');
      this._alert = document.querySelector('.alert');
      this._handleActivate = this._activate.bind(this);
      this._handleDeactivate = this._deactivate.bind(this);
      this._handleRemove = this._remove.bind(this);
      this._handleEdit = this._edit.bind(this);
      this._handleUpdate = this._update.bind(this);
      this._handleCloseUpdate = this._closeUpdate.bind(this);
      this._handleAdd = this._add.bind(this);

      this._bindEvents();
    }

    if (document.querySelectorAll('#filtered-list').length > 0) {
      var orderables = document.querySelectorAll('#filtered-list thead th');
      var columns = [];
      Array.prototype.forEach.call(orderables, function (orderable) {
        var order = orderable.getAttribute('data-orderable');
        if (order != null) {
          columns.push({ 'orderable': order == 'true' ? true : false });
        } else {
          columns.push(null);
        }
      });
      this.table = $('#filtered-list').DataTable({
        paging: false,
        'info': false,
        'columns': columns
      });
    }

    if (document.querySelectorAll('#filtered-list-url').length > 0) {
      this._handleFormUserRoleSubmit = this._formUserRoleSubmit.bind(this);

      this._formUserRole = document.querySelector('[data-user-role]');
      this._formUserRoleSave = document.querySelector('[data-save-user-role]');

      if (typeof this._formUserRole !== 'undefined' && this._formUserRole !== null) {
        this._formUserRole.addEventListener('submit', this._handleFormUserRoleSubmit);
      }
    }
  },
  _bindEvents: function _bindEvents() {
    var _this = this;

    this._activateBtn = this._scope.querySelectorAll('[data-activate]');
    this._deactivateBtn = this._scope.querySelectorAll('[data-deactivate]');
    this._removeBtn = this._scope.querySelectorAll('[data-remove]');
    this._editBtn = this._scope.querySelectorAll('[data-edit]');
    this._updateBtn = this._scope.querySelectorAll('[data-update]');
    this._addBtn = this._scope.querySelector('[data-add-user]');

    Array.prototype.forEach.call(this._activateBtn, function (btn) {
      btn.removeEventListener('click', _this._handleActivate);
      btn.addEventListener('click', _this._handleActivate);
    });

    Array.prototype.forEach.call(this._deactivateBtn, function (btn) {
      btn.removeEventListener('click', _this._handleDeactivate);
      btn.addEventListener('click', _this._handleDeactivate);
    });

    Array.prototype.forEach.call(this._removeBtn, function (btn) {
      btn.removeEventListener('click', _this._handleRemove);
      btn.addEventListener('click', _this._handleRemove);
    });

    Array.prototype.forEach.call(this._editBtn, function (btn) {
      btn.removeEventListener('click', _this._handleEdit, true);
      btn.addEventListener('click', _this._handleEdit, true);
    });

    Array.prototype.forEach.call(this._updateBtn, function (btn) {
      btn.removeEventListener('click', _this._handleUpdate, true);
      btn.addEventListener('click', _this._handleUpdate, true);
    });

    if (typeof this._addBtn !== 'undefined' && this._addBtn !== null) {
      this._addBtn.addEventListener('click', this._handleAdd);
    }
  },
  _formUserRoleSubmit: function _formUserRoleSubmit(e) {
    e.preventDefault();

    var inputs = this._formUserRole.querySelectorAll('input[type=checkbox]');
    var data = {};
    Array.prototype.forEach.call(inputs, function (input) {
      if (!input.disabled) {
        var name = input.getAttribute('name');
        if (data[name] == null) {
          data[name] = [];
        }
        if (input.checked) {
          data[name].push(input.getAttribute('value'));
        }
      }
    });

    var toSave = _qs2.default.stringify(data);

    this._ajax({
      url: '/abe/list-url/save',
      body: toSave,
      method: 'post'
    }, function () {});
  },
  _activate: function _activate(e) {
    var _this2 = this;

    var target = e.currentTarget;
    var id = target.getAttribute('data-user-id');

    var toSave = _qs2.default.stringify({
      id: id
    });

    this._ajax({
      url: '/abe/users/activate',
      body: toSave,
      method: 'post'
    }, function () {
      var childGlyph = target.querySelector('.glyphicon');
      childGlyph.classList.remove('glyphicon-eye-open', 'text-info');
      childGlyph.classList.add('glyphicon-eye-close', 'text-danger');
      target.classList.remove('glyphicon-eye-close', 'text-danger');
      target.classList.add('glyphicon-eye-open', 'text-info');
      target.removeEventListener('click', _this2._handleActivate);
      target.addEventListener('click', _this2._handleDeactivate);
    });
  },
  _deactivate: function _deactivate(e) {
    var _this3 = this;

    var target = e.currentTarget;
    var id = target.getAttribute('data-user-id');

    var toSave = _qs2.default.stringify({
      id: id
    });

    this._ajax({
      url: '/abe/users/deactivate',
      body: toSave,
      method: 'post'
    }, function () {
      var childGlyph = target.querySelector('.glyphicon');
      childGlyph.classList.remove('glyphicon-eye-close', 'text-danger');
      childGlyph.classList.add('glyphicon-eye-open', 'text-info');
      target.classList.remove('glyphicon-eye-open', 'text-info');
      target.classList.add('glyphicon-eye-close', 'text-danger');
      target.removeEventListener('click', _this3._handleDeactivate);
      target.addEventListener('click', _this3._handleActivate);
    });
  },
  _edit: function _edit(e) {
    var parent = e.currentTarget.parentNode.parentNode;
    e.currentTarget.removeEventListener('click', this._handleEdit, true);

    parent.classList.add('editing');
    var closeUpdateBtn = parent.querySelector('[data-close-update]');
    closeUpdateBtn.removeEventListener('click', this._handleCloseUpdate);
    closeUpdateBtn.addEventListener('click', this._handleCloseUpdate);
  },
  _closeFormUpdate: function _closeFormUpdate(target) {
    var parent = target.parentNode.parentNode.parentNode;
    var edit = parent.querySelector('[data-edit]');
    parent.classList.remove('editing');
    edit.addEventListener('click', this._handleEdit, true);
    target.removeEventListener('click', this._handleCloseUpdate);
  },

  _closeUpdate: function _closeUpdate(e) {
    this._closeFormUpdate(e.currentTarget);
  },
  _update: function _update(e) {
    var _this4 = this;

    var parent = e.currentTarget.parentNode.parentNode.parentNode;
    var target = e.currentTarget;
    var data = {
      id: target.getAttribute('data-user-id')
    };

    var inputs = parent.querySelectorAll('.form-control');
    var msg = '';
    var hasError = false;
    Array.prototype.forEach.call(inputs, function (input) {
      data[input.name] = input.value;

      if (input.name === 'email' && !this._validateEmail(input.value)) {
        hasError = true;
        input.parentNode.classList.add('has-error');
        this._alert.classList.remove('hidden');
        msg += 'email is invalid<br />';
        return;
      } else if (input.value.trim() === '') {
        hasError = true;
        input.parentNode.classList.add('has-error');
        this._alert.classList.remove('hidden');
        msg += input.name + ' is invalid<br />';
        return;
      } else {
        input.parentNode.classList.remove('has-error');
      }
    }.bind(this));

    if (hasError) {
      this._alert.innerHTML = msg;
      return;
    } else {
      this._alert.classList.add('hidden');
      this._alert.innerHTML = '';
    }
    var toSave = _qs2.default.stringify(data);

    this._ajax({
      url: '/abe/users/update',
      body: toSave,
      method: 'post'
    }, function (code, responseText) {
      var response = JSON.parse(responseText);
      if (response.success === 1) {
        Array.prototype.forEach.call(inputs, function (input) {
          input.parentNode.parentNode.querySelector('.value').innerHTML = input.value;
        });
        _this4._closeFormUpdate(target);
      } else {
        _this4._alert.classList.remove('hidden');
        _this4._alert.innerHTML = response.message;
      }
    });
  },
  _remove: function _remove(e) {
    var confirmDelete = confirm(e.currentTarget.getAttribute('data-text'));
    if (!confirmDelete) return;

    var target = e.currentTarget;
    var id = target.getAttribute('data-user-id');
    var toSave = _qs2.default.stringify({
      id: id
    });

    this._ajax({
      url: '/abe/users/remove',
      body: toSave,
      method: 'post'
    }, function () {
      target.parentNode.parentNode.remove();
    });
  },
  _validateEmail: function _validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },
  _add: function _add() {
    var _this5 = this;

    this._alert.classList.add('hidden');
    var username = document.querySelector('[data-add-user-username]');
    if (typeof username.value === 'undefined' || username.value === null || username.value === '') {
      username.parentNode.classList.add('has-error');
      return;
    }
    username.parentNode.classList.remove('has-error');

    var name = document.querySelector('[data-add-user-name]');
    if (typeof name.value === 'undefined' || name.value === null || name.value === '') {
      name.parentNode.classList.add('has-error');
      return;
    }
    name.parentNode.classList.remove('has-error');

    var email = document.querySelector('[data-add-user-email]');
    if (typeof email.value === 'undefined' || email.value === null || email.value === '') {
      email.parentNode.classList.add('has-error');
      return;
    }
    if (!this._validateEmail(email.value)) {
      email.parentNode.classList.add('has-error');
      this._alert.classList.remove('hidden');
      this._alert.innerHTML = 'email is invalid';
      return;
    }
    email.parentNode.classList.remove('has-error');

    var password = document.querySelector('[data-add-user-password]');
    if (typeof password.value === 'undefined' || password.value === null || password.value === '') {
      password.parentNode.classList.add('has-error');
      return;
    }

    password.parentNode.classList.remove('has-error');

    var role = document.querySelector('[data-add-user-role]');
    var toSave = _qs2.default.stringify({
      username: username.value,
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    });

    this._ajax({
      url: '/abe/users/add',
      body: toSave,
      method: 'post'
    }, function (code, responseText) {
      var data = JSON.parse(responseText);
      if (data.success === 1) {
        var tr = document.createElement('tr');
        var oldTr = document.querySelector('[data-user-base]');
        if (typeof oldTr !== 'undefined' && oldTr !== null) {
          tr.innerHTML = oldTr.innerHTML;

          var tdUsername = tr.querySelector('.td-username');
          tdUsername.querySelector('.value').innerHTML = data.user.username;
          tdUsername.querySelector('input').value = data.user.username;

          var tdName = tr.querySelector('.td-name');
          tdName.querySelector('.value').innerHTML = data.user.name;
          tdName.querySelector('input').value = data.user.name;

          var tdEmail = tr.querySelector('.td-email');
          tdEmail.querySelector('.value').innerHTML = data.user.email;
          tdEmail.querySelector('input').value = data.user.email;

          var tdRole = tr.querySelector('.td-role');
          tdRole.querySelector('.value').innerHTML = data.user.role.name;
          var tdRoleOptions = tdRole.querySelectorAll('select option');
          Array.prototype.forEach.call(tdRoleOptions, function (option) {
            if (option.value === data.user.role.name) {
              option.selected = 'selected';
            }
          });

          var tdActive = tr.querySelector('.td-active');
          var glypEyeClose = tdActive.querySelector('.glyphicon-eye-close');
          glypEyeClose.addEventListener('click', _this5._handleActivate, true);
          glypEyeClose.setAttribute('data-user-id', data.user.id);

          var tdActions = tr.querySelector('.td-actions');
          var glypEdit = tdActions.querySelector('.glyphicon-pencil');
          glypEdit.addEventListener('click', _this5._handleEdit, true);
          glypEdit.setAttribute('data-user-id', data.user.id);

          var glypOk = tdActions.querySelector('.glyphicon-ok');
          glypOk.addEventListener('click', _this5._handleUpdate, true);
          glypOk.setAttribute('data-user-id', data.user.id);

          var glypCloseUpdate = tdActions.querySelector('.glyphicon-remove');
          glypCloseUpdate.setAttribute('data-user-id', data.user.id);
          // glypCloseUpdate.addEventListener('click', this._handleCloseUpdate, true)

          var glypRemove = tdActions.querySelector('.glyphicon-trash');
          glypRemove.setAttribute('data-user-id', data.user.id);
          glypRemove.addEventListener('click', _this5._handleRemove, true);
        }

        _this5._table.appendChild(tr);

        username.value = '';
        name.value = '';
        email.value = '';
        password.value = '';
      } else {
        _this5._alert.classList.remove('hidden');
        _this5._alert.innerHTML = data.message;
      }
    });
  }
};

exports.default = usersList;

// var userListEle = document.querySelector('.user-list');
// if(typeof userListEle !== 'undefined' && userListEle !== null) {
//   usersList.init(userListEle)
// }

},{"nanoajax":1,"qs":3}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nanoajax = require('nanoajax');

var _nanoajax2 = _interopRequireDefault(_nanoajax);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*global document, confirm, $ */

var userProfil = {
  init: function init() {
    var scope = document.querySelector('.user-profil');
    if (scope != null) {
      this._ajax = _nanoajax2.default.ajax;

      this._scope = scope;
      this._form = this._scope.querySelector('form');
      this._info = this._scope.querySelector('[data-info-msg="true"]');
      this._handleSubmit = this._submit.bind(this);

      this._bindEvents();
    }
  },
  _bindEvents: function _bindEvents() {

    this._form.addEventListener('submit', this._handleSubmit);
  },
  _submit: function _submit(e) {
    var _this = this;

    e.preventDefault();

    var inputs = this._form.querySelectorAll('input,select');
    var data = {};
    var isValid = true;
    Array.prototype.forEach.call(inputs, function (input) {
      if (!input.disabled) {
        var name = input.getAttribute('name');
        var value = input.value;
        var required = input.getAttribute('required');
        if (value == null && required == "true") {
          isValid = false;
        } else if (value !== null && value !== "") {
          data[name] = value;
        }
      }
    });

    var toSave = _qs2.default.stringify(data);

    if (isValid) {
      this._ajax({
        url: this._form.getAttribute('action'),
        body: toSave,
        method: 'post'
      }, function (code, responseText) {
        var res = JSON.parse(responseText);
        if (res.success === 1) {
          _this._info.classList.add('hidden');
        } else {
          _this._info.classList.remove('hidden');
          _this._info.innerHTML = res.message;
        }
      });
    }

    return false;
  }
};

exports.default = userProfil;

},{"nanoajax":1,"qs":3}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _UserList = require('./modules/UserList');

var _UserList2 = _interopRequireDefault(_UserList);

var _UserProfil = require('./modules/UserProfil');

var _UserProfil2 = _interopRequireDefault(_UserProfil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*global document, window, json, XMLHttpRequest */
var singleton = Symbol();
var singletonEnforcer = Symbol();

var UserLogin = function () {
  function UserLogin(enforcer) {
    _classCallCheck(this, UserLogin);

    this.init();
    if (enforcer != singletonEnforcer) throw 'Cannot construct UserLogin singleton';
  }

  _createClass(UserLogin, [{
    key: 'init',
    value: function init() {
      _UserList2.default.init();
      _UserProfil2.default.init();

      this.isInit = true;
      // const
      this._btnActions = [].slice.call(document.querySelectorAll('.form-wrapper .btns [data-workflow]'));
      this._formWrapper = document.querySelector('.abeform-wrapper');
      if (this._btnActions.length > 0) {
        this._btnHidden = document.querySelector('.form-wrapper .btns [data-action="draft"]');
        this._btnReject = document.querySelector('.form-wrapper .btns [data-extra-btn="reject"]');
        this._btnEdit = document.querySelector('.form-wrapper .btns [data-extra-btn="edit"]');

        this._inputs = [].slice.call(this._formWrapper.querySelectorAll('.tab-pane:not([id=slug]) input.form-abe'));
        this._inputs = this._inputs.concat([].slice.call(this._formWrapper.querySelectorAll('.tab-pane:not([id=slug]) textarea.form-abe')));
        this._inputsFile = [].slice.call(this._formWrapper.querySelectorAll('.tab-pane:not([id=slug]) .upload-wrapper input[type="file"]'));
        this._selects = [].slice.call(this._formWrapper.querySelectorAll('.tab-pane:not([id=slug]) select'));
        this._inputHasChanged = false;
        this._checkInputChanged = typeof this._btnHidden !== 'undefined' && this._btnHidden !== null ? true : false;

        // bind this
        this._handleInputChange = this._inputChange.bind(this);
        this._handleOnSaved = this._onSaved.bind(this);
        // this._handleWillSave = this._willSaved.bind(this);

        this._bindEvent();
        this._showHideBtn();
      }
    }
  }, {
    key: '_csrfToken',
    value: function _csrfToken() {
      var csrfToken = document.querySelector('#globalCsrfToken').value;

      (function (open) {
        XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
          // extracting domain of the query
          var domain = url.indexOf('://') > -1 ? url.split('/')[2] : window.location.hostname;
          this._domain = domain.split(':')[0];
          this._port = domain.split(':').length == 2 ? domain.split(':')[1] : window.location.port;
          open.call(this, method, url, async, user, password);
        };
      })(XMLHttpRequest.prototype.open);

      (function (send) {
        XMLHttpRequest.prototype.send = function (data) {
          // if query domain == abe domain => CSRF token
          if (window.location.hostname == this._domain && window.location.port == this._port) this.setRequestHeader('X-CSRF-Token', csrfToken);
          send.call(this, data);
        };
      })(XMLHttpRequest.prototype.send);
    }
  }, {
    key: '_showHideBtn',
    value: function _showHideBtn() {
      this._changeCurrentBtn(document.querySelector('.form-wrapper .btns [data-action="' + json.abe_meta.status + '"]'));

      var isCurrent = false;
      Array.prototype.forEach.call(this._btnActions, function (btn) {

        if (btn.classList.contains('current')) {
          btn.classList.add('btn-hidden');
          // btn.classList.remove('btn-hidden')
          isCurrent = true;
        } else {
          if (isCurrent) {
            btn.classList.remove('btn-hidden');
            isCurrent = false;
          } else {
            btn.classList.add('btn-hidden');
          }
        }
      }.bind(this));

      if (json.abe_meta.status !== 'draft' && json.abe_meta.status !== 'publish') {
        this._btnReject.classList.remove('btn-hidden');
      } else {
        this._btnReject.classList.add('btn-hidden');
      }
      if (json.abe_meta.status === 'publish') {
        this._btnEdit.classList.remove('btn-hidden');
      } else {
        this._btnEdit.classList.add('btn-hidden');
      }
      if (json.abe_meta.status === 'draft') {
        this._enableInput();
        this._btnActions[0].classList.remove('btn-hidden');
        this._btnActions[1].classList.remove('btn-hidden');
      } else {
        this._disableInput();
      }
    }
  }, {
    key: '_changeCurrentBtn',
    value: function _changeCurrentBtn(currentBtn) {
      Array.prototype.forEach.call(this._btnActions, function (btn) {
        btn.classList.remove('current');
      }.bind(this));
      currentBtn.classList.add('current');
    }
  }, {
    key: '_disableInput',
    value: function _disableInput() {
      Array.prototype.forEach.call(this._inputsFile, function (input) {
        input.setAttribute('disabled', '');
      }.bind(this));
      Array.prototype.forEach.call(this._inputs, function (input) {
        input.setAttribute('disabled', '');
      }.bind(this));
      Array.prototype.forEach.call(this._selects, function (input) {
        input.setAttribute('disabled', '');
      }.bind(this));
    }
  }, {
    key: '_enableInput',
    value: function _enableInput() {
      Array.prototype.forEach.call(this._inputsFile, function (input) {
        input.removeAttribute('disabled');
      }.bind(this));
      Array.prototype.forEach.call(this._inputs, function (input) {
        input.removeAttribute('disabled');
      }.bind(this));
      Array.prototype.forEach.call(this._selects, function (input) {
        input.removeAttribute('disabled');
      }.bind(this));
    }
  }, {
    key: '_bindEvent',
    value: function _bindEvent() {
      window.abe.save.onFileSaved(this._handleOnSaved);

      Array.prototype.forEach.call(this._btnActions, function (btn) {
        btn.addEventListener('click', this._handleWillSave);
      }.bind(this));

      Array.prototype.forEach.call(this._inputsFile, function (input) {
        if (!this._checkInputChanged) {
          input.setAttribute('disabled', '');
        }
      }.bind(this));
      Array.prototype.forEach.call(this._inputs, function (input) {
        if (!this._checkInputChanged) {
          input.setAttribute('disabled', '');
        }
        input.addEventListener('keyup', this._handleInputChange);
      }.bind(this));
      Array.prototype.forEach.call(this._selects, function (input) {
        if (!this._checkInputChanged) {
          input.setAttribute('disabled', '');
        }
        input.addEventListener('change', this._handleInputChange);
      }.bind(this));
    }
  }, {
    key: '_onSaved',
    value: function _onSaved() {
      this._showHideBtn();
    }
  }, {
    key: '_inputChange',
    value: function _inputChange() {
      if (json.abe_meta.status !== 'draft') {
        if (!this._checkInputChanged || this._inputHasChanged) return;
        this._inputHasChanged = true;
        Array.prototype.forEach.call(document.querySelectorAll('.btn-save'), function (btn) {
          if (!btn.classList.contains('btn-hidden')) btn.classList.add('btn-hidden');
        }.bind(this));
        this._btnHidden.classList.remove('btn-hidden');
      }
    }
  }], [{
    key: 'instance',
    get: function get() {
      if (!this[singleton]) {
        this[singleton] = new UserLogin(singletonEnforcer);
      }
      return this[singleton];
    }
  }]);

  return UserLogin;
}();

exports.default = UserLogin;


document.addEventListener('DOMContentLoaded', function () {
  UserLogin.instance;
  UserLogin.instance._csrfToken();
});

},{"./modules/UserList":7,"./modules/UserProfil":8}]},{},[9]);
