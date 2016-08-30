'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _loremIpsum = require('lorem-ipsum');

var _loremIpsum2 = _interopRequireDefault(_loremIpsum);

var _cliColor = require('cli-color');

var _cliColor2 = _interopRequireDefault(_cliColor);

var _nodeSqlparser = require('node-sqlparser');

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _ajaxRequest = require('ajax-request');

var _ajaxRequest2 = _interopRequireDefault(_ajaxRequest);

var _es6Promise = require('es6-promise');

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sql = function () {
  function Sql() {
    _classCallCheck(this, Sql);
  }

  _createClass(Sql, null, [{
    key: 'recurseWhere',
    value: function recurseWhere(where) {
      var operator = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

      var arr = [];
      var obj = {};
      var operatorLeft = operator;
      var operatorRight = operator;

      if (typeof where.left !== 'undefined' && where.left !== null && typeof where.right !== 'undefined' && where.right !== null && typeof where.operator !== 'undefined' && where.operator !== null) {
        // SQL WHERE

        if (typeof where.left.column !== 'undefined' && where.left.column !== null && typeof where.right.column !== 'undefined' && where.right.column !== null && typeof where.operator !== 'undefined' && where.operator !== null) {
          obj.left = where.left.column;
          obj.right = where.right.column;
          obj.compare = where.operator;
          obj.operator = operator;
          arr.push(obj);
        } else if (typeof where.left.column !== 'undefined' && where.left.column !== null && typeof where.right.value !== 'undefined' && where.right.value !== null && typeof where.operator !== 'undefined' && where.operator !== null) {
          obj.left = where.left.column;
          obj.right = where.right.value;
          obj.compare = where.operator;
          obj.operator = operator;
          arr.push(obj);
        } else {
          if (typeof where.left.left !== 'undefined' && where.left.left !== null) {
            if (typeof where.left.left.type !== 'undefined' && where.left.left.type !== null) {
              operator = where.operator;
            }
          }
        }

        if (typeof where.left.left !== 'undefined' && where.left.left !== null) {
          arr = arr.concat(Sql.recurseWhere(where.left, operator));
        }

        if (typeof where.right.right !== 'undefined' && where.right.right !== null) {
          arr = arr.concat(Sql.recurseWhere(where.right, operator));
        }
      }

      return arr;
    }
  }, {
    key: 'cleanRequest',
    value: function cleanRequest(str, jsonPage) {
      var matchFrom = /from .(.*?) /;
      var matchVariable = /{{([a-zA-Z]*)}}/;
      var match;

      var matchFromExec = matchFrom.exec(str);
      if (typeof matchFromExec !== 'undefined' && matchFromExec !== null && typeof matchFromExec[1] !== 'undefined' && matchFromExec[1] !== null) {

        var fromMatch;
        var toReplace = matchFromExec[1];
        while (fromMatch = matchVariable.exec(toReplace)) {
          if (typeof fromMatch !== 'undefined' && fromMatch !== null && typeof fromMatch[1] !== 'undefined' && fromMatch[1] !== null) {
            var value = Sql.deep_value_array(jsonPage, fromMatch[1]);
            if (typeof value !== 'undefined' && value !== null) {
              toReplace = toReplace.replace('{{' + fromMatch[1] + '}}', value);
            } else {
              toReplace = toReplace.replace('{{' + fromMatch[1] + '}}', '');
            }
          }
        }

        str = str.replace(matchFromExec[1], toReplace);
      }

      var from = /from ([\S\s]+)/.exec(str);

      var matches = from;
      if (matches[1]) {
        var res = matches[1];
        var splitAttr = [' where ', ' order by ', ' limit ', ' WHERE ', ' ORDER BY ', ' LIMIT '];
        for (var i = 0; i < splitAttr.length; i++) {
          if (res.indexOf(splitAttr[i]) > -1) {
            res = res.substring(0, res.indexOf(splitAttr[i]));
          }
        }
        var escapedFrom = res.replace(/\//g, '___abe___');
        escapedFrom = escapedFrom.replace(/\./g, '___abe_dot___');
        escapedFrom = escapedFrom.replace(/-/g, '___abe_dash___');
        str = str.replace(res, escapedFrom);
      }

      return str;
    }
  }, {
    key: 'handleSqlRequest',
    value: function handleSqlRequest(str, jsonPage) {
      var request = (0, _nodeSqlparser.parse)(Sql.cleanRequest(str, jsonPage));
      var reconstructSql = '';

      // SQL TYPE
      var type = '';
      if (typeof request.type !== 'undefined' && request.type !== null) {
        type = request.type;
      }
      reconstructSql += type + ' ';

      // SQL COLUMNS
      var columns = [];
      if (typeof request.columns !== 'undefined' && request.columns !== null) {
        if (request.columns === '*') {
          columns.push('*');
        } else {
          Array.prototype.forEach.call(request.columns, function (item) {
            columns.push(item.expr.column);
          });
        }
      }
      reconstructSql += JSON.stringify(columns) + ' ';

      // SQL FROM
      var from = [];
      if (typeof request.from !== 'undefined' && request.from !== null) {

        Array.prototype.forEach.call(request.from, function (item) {
          from.push(item.table);
        });
      } else {
        from.push('*');
      }
      reconstructSql += 'from ' + JSON.stringify(from) + ' ';

      var where;
      if (typeof request.where !== 'undefined' && request.where !== null) {
        where = Sql.recurseWhere(request.where);
        reconstructSql += 'where ';
        Array.prototype.forEach.call(where, function (w) {
          reconstructSql += w.operator + ' ' + w.left + ' ' + w.compare + ' ' + w.right + ' ';
        });
      }

      var limit = -1;
      if (typeof request.limit !== 'undefined' && request.limit !== null) {
        limit = request.limit[request.limit.length - 1].value;
      }

      var orderby;
      if (typeof request.orderby !== 'undefined' && request.orderby !== null && request.orderby.length > 0) {
        orderby = {
          column: request.orderby[0].expr.column,
          type: request.orderby[0].type
        };
        reconstructSql += 'ORDER BY ' + orderby.column + ' ' + orderby.type + ' ';
      }

      return {
        type: type,
        columns: columns,
        from: from,
        where: where,
        string: reconstructSql,
        limit: limit,
        orderby: orderby
      };
    }
  }, {
    key: 'sortByDateDesc',
    value: function sortByDateDesc(a, b) {
      var dateA = new Date(a.date);
      var dateB = new Date(b.date);
      if (dateA < dateB) {
        return 1;
      } else if (dateA > dateB) {
        return -1;
      }
      return 0;
    }
  }, {
    key: 'shuffle',
    value: function shuffle(array) {
      var currentIndex = array.length,
          temporaryValue,
          randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }
  }, {
    key: 'sortByDateAsc',
    value: function sortByDateAsc(a, b) {
      var dateA = new Date(a.date);
      var dateB = new Date(b.date);
      if (dateA > dateB) {
        return 1;
      } else if (dateA < dateB) {
        return -1;
      }
      return 0;
    }
  }, {
    key: 'getDataSource',
    value: function getDataSource(str) {
      var res = str.substring(str.indexOf('source=') + 8, str.length);

      var reg = /([^'"]*=[\s\S]*?}})/g;
      var matches = res.match(reg);
      if (typeof matches !== 'undefined' && matches !== null) {
        Array.prototype.forEach.call(matches, function (match) {
          res = res.replace(match, '');
        });
      } else {
        res = res.replace('}}', '');
      }

      return res.substring(0, res.length - 1);
    }

    /**
     * replaces escaped characters with the right ones
     * @param  {String} statement the from clause
     * @return {String}           the from sanitized
     */

  }, {
    key: 'sanitizeFromStatement',
    value: function sanitizeFromStatement(statement) {
      var from = '';

      if (typeof statement !== 'undefined' && statement !== null) {
        from = statement[0].replace(/___abe_dot___/g, '.');
        from = from.replace(/___abe___/g, '/');
        from = from.replace(/___abe_dash___/g, '-');
      }

      return from;
    }

    /**
     * calculate the directory to analyze from the from clause
     * @param  {String} statement the from clause
     * @param  {String} tplPath   the path from the template originator
     * @return {string}           the directory to analyze
     */

  }, {
    key: 'getFromDirectory',
    value: function getFromDirectory(statement, tplPath) {
      var path = '';
      if (typeof tplPath === 'undefined' || tplPath === null || tplPath === '') {
        tplPath = '/';
      }

      if (statement === '' || statement === '*' || statement === '/') {
        path = _.fileUtils.concatPath(_.config.root, _.config.data.url);
      } else if (statement === './') {
        path = _.fileUtils.concatPath(_.config.root, _.config.data.url, tplPath);
      } else if (statement.indexOf('/') === 0) {
        path = _.fileUtils.concatPath(_.config.root, _.config.data.url, statement);
      } else if (statement.indexOf('/') !== 0) {
        path = _.fileUtils.concatPath(_.config.root, _.config.data.url, tplPath, statement);
      }

      return path;
    }
  }, {
    key: 'executeOrderByClause',
    value: function executeOrderByClause(files, orderby) {
      if (typeof orderby !== 'undefined' && orderby !== null) {
        if (orderby.column.toLowerCase() === 'random') {
          Sql.shuffle(files);
        } else if (orderby.column.toLowerCase() === 'date') {
          if (orderby.type === 'ASC') {
            files.sort(Sql.sortByDateAsc);
          } else if (orderby.type === 'DESC') {
            files.sort(Sql.sortByDateDesc);
          }
        }
      }

      return files;
    }
  }, {
    key: 'executeFromClause',
    value: function executeFromClause(statement, path) {
      var files = [];
      var recursive = 99;
      var fileRegex = /(.*(-abe-).*Z\.json)/;
      var from = Sql.sanitizeFromStatement(statement);

      // if the from clause ends with a dot, we won't recurse the directory analyze
      if (from.slice(-1) === '.') {
        recursive = 0;
        from = from.slice(0, -1);
      }

      var fromDirectory = Sql.getFromDirectory(from, path);

      if (_.folderUtils.isFolder(fromDirectory)) {
        // we'll get only published files which don't contain "-abe-"
        files = _.FileParser.getFiles(fromDirectory, true, recursive, fileRegex, true);
      }

      return files;
    }
  }, {
    key: 'executeQuery',
    value: function executeQuery(path, match, jsonPage) {
      var p = new _es6Promise.Promise(function (resolve, reject) {
        var res = [];
        var files = [];
        var request = Sql.handleSqlRequest((0, _.getAttr)(match, 'source'), jsonPage);

        files = Sql.executeFromClause(request.from, path);
        files = Sql.executeOrderByClause(files, request.orderby);
        res = Sql.executeWhereClause(files, request.where, request.limit, request.columns, jsonPage);

        resolve(res);
      });

      return p;
    }
  }, {
    key: 'getSourceType',
    value: function getSourceType(str) {
      if (/http:\/\/|https:\/\//.test(str)) {
        return 'url';
      }

      if (/select[\S\s]*?from/.test(str)) {
        return 'request';
      }

      if (/[\{|\[][[\S\s]*?[\{|\]]/.test(str)) {
        return 'value';
      }

      if (/\.json/.test(str)) {
        return 'file';
      }

      return 'other';
    }
  }, {
    key: 'deep_value',
    value: function deep_value(obj, path) {

      if (path.indexOf('.') === -1) {
        return typeof obj[path] !== 'undefined' && obj[path] !== null ? obj[path] : null;
      }

      var pathSplit = path.split('.');
      var res = JSON.parse(JSON.stringify(obj));
      for (var i = 0; i < pathSplit.length; i++) {
        if (typeof res[pathSplit[i]] !== 'undefined' && res[pathSplit[i]] !== null) {
          res = res[pathSplit[i]];
        } else {
          return null;
        }
      }

      return res;
    }
  }, {
    key: 'deep_value_array',
    value: function deep_value_array(obj, path) {

      if (path.indexOf('.') === -1) {
        return typeof obj[path] !== 'undefined' && obj[path] !== null ? obj[path] : null;
      }

      var pathSplit = path.split('.');
      var res = JSON.parse(JSON.stringify(obj));

      while (pathSplit.length > 0) {

        if (typeof res[pathSplit[0]] !== 'undefined' && res[pathSplit[0]] !== null) {
          if (_typeof(res[pathSplit[0]]) === 'object' && Object.prototype.toString.call(res[pathSplit[0]]) === '[object Array]') {
            var resArray = [];

            Array.prototype.forEach.call(res[pathSplit[0]], function (item) {
              resArray.push(Sql.deep_value_array(item, pathSplit.join('.').replace(pathSplit[0] + '.', '')));
            });
            res = resArray;
            pathSplit.shift();
          } else {
            res = res[pathSplit[0]];
          }
        } else {
          return null;
        }
        pathSplit.shift();
      }

      return res;
    }
  }, {
    key: 'executeWhereClause',
    value: function executeWhereClause(files, wheres, maxLimit, columns, jsonPage) {
      var res = [];
      var limit = 0;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var file = _step.value;

          if (limit < maxLimit || maxLimit === -1) {
            var doc = Sql.executeWhereClauseToFile(file, wheres, jsonPage);

            if (doc) {
              var json = JSON.parse(JSON.stringify(doc));
              var jsonValues = {};

              if (typeof columns !== 'undefined' && columns !== null && columns.length > 0 && columns[0] !== '*') {

                Array.prototype.forEach.call(columns, function (column) {
                  if (typeof json[column] !== 'undefined' && json[column] !== null) {
                    jsonValues[column] = json[column];
                  }
                });
                jsonValues[_.config.meta.name] = json[_.config.meta.name];
              } else {
                jsonValues = json;
              }

              res.push(jsonValues);
              limit++;
            }
          } else {
            break;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return res;
    }
  }, {
    key: 'executeWhereClauseToFile',
    value: function executeWhereClauseToFile(file, wheres, jsonPage) {
      var json = {};
      if (_.fileUtils.isFile(file.path)) {
        json = _fsExtra2.default.readJsonSync(file.path);
      }
      var shouldAdd = json;

      if (typeof wheres !== 'undefined' && wheres !== null) {
        (function () {
          var meta = _.config.meta.name;
          if (typeof json[meta] !== 'undefined' && json[meta] !== null) {
            Array.prototype.forEach.call(wheres, function (where) {
              var value;
              var compare;

              if (where.left === 'template') {
                value = _.FileParser.getTemplate(json[meta].template);
              } else {
                value = Sql.deep_value_array(json, where.left);
              }
              compare = where.right;

              var matchVariable = /^{{(.*)}}$/.exec(compare);
              if (typeof matchVariable !== 'undefined' && matchVariable !== null && matchVariable.length > 0) {
                var shouldCompare = Sql.deep_value_array(jsonPage, matchVariable[1]);
                if (typeof shouldCompare !== 'undefined' && shouldCompare !== null) {
                  compare = shouldCompare;
                } else {
                  shouldAdd = false;
                }
              }

              if (typeof value !== 'undefined' && value !== null) {
                switch (where.compare) {
                  case '=':
                    if (where.left === 'template') {
                      if (value.indexOf('/') > -1 && value !== compare) {
                        shouldAdd = false;
                      } else if (value.indexOf('/') === -1 && compare.indexOf(value) === -1) {
                        shouldAdd = false;
                      }
                    } else {

                      // if both entries are Array
                      var foundOne = false;
                      if ((typeof compare === 'undefined' ? 'undefined' : _typeof(compare)) === 'object' && Object.prototype.toString.call(compare) === '[object Array]' && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && Object.prototype.toString.call(value) === '[object Array]') {

                        Array.prototype.forEach.call(value, function (v) {
                          if (compare.includes(v)) {
                            foundOne = true;
                          }
                        });
                      } else if ((typeof compare === 'undefined' ? 'undefined' : _typeof(compare)) === 'object' && Object.prototype.toString.call(compare) === '[object Array]') {
                        // only "compare" is Array
                        if (compare.includes(value)) {
                          foundOne = true;
                        }
                      } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
                        // only "value" is Array
                        if (value.includes(compare)) {
                          foundOne = true;
                        }
                      } else if (value == compare) {
                        // only none is Array
                        foundOne = true;
                      }

                      if (!foundOne) {
                        shouldAdd = false;
                      }
                    }
                    break;
                  case '!=':
                    if (where.left === 'template') {

                      if (value.indexOf('/') > -1 && value === compare) {
                        shouldAdd = false;
                      } else if (value.indexOf('/') === -1 && compare.indexOf(value) !== -1) {
                        shouldAdd = false;
                      }
                    } else {

                      // if both entries are Array
                      var foundOne = false;
                      if ((typeof compare === 'undefined' ? 'undefined' : _typeof(compare)) === 'object' && Object.prototype.toString.call(compare) === '[object Array]' && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && Object.prototype.toString.call(value) === '[object Array]') {

                        Array.prototype.forEach.call(value, function (v) {
                          if (compare.includes(v)) {
                            foundOne = true;
                          }
                        });
                      } else if ((typeof compare === 'undefined' ? 'undefined' : _typeof(compare)) === 'object' && Object.prototype.toString.call(compare) === '[object Array]') {
                        // only "compare" is Array
                        if (compare.includes(value)) {
                          foundOne = true;
                        }
                      } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
                        // only "value" is Array
                        if (value.includes(compare)) {
                          foundOne = true;
                        }
                      } else if (value === compare) {
                        // only none is Array
                        foundOne = true;
                      }

                      if (foundOne) {
                        shouldAdd = false;
                      }
                    }
                    break;
                  case 'LIKE':
                    if (where.left === 'template') {

                      if (value.indexOf(compare) === -1) {
                        shouldAdd = false;
                      }
                    } else {

                      // if both entries are Array
                      var foundOne = false;
                      if ((typeof compare === 'undefined' ? 'undefined' : _typeof(compare)) === 'object' && Object.prototype.toString.call(compare) === '[object Array]' && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && Object.prototype.toString.call(value) === '[object Array]') {

                        Array.prototype.forEach.call(compare, function (v) {
                          Array.prototype.forEach.call(value, function (v2) {
                            if (v.indexOf(v2) !== -1) {
                              foundOne = true;
                            }
                          });
                        });
                      } else if ((typeof compare === 'undefined' ? 'undefined' : _typeof(compare)) === 'object' && Object.prototype.toString.call(compare) === '[object Array]') {
                        // only "compare" is Array
                        Array.prototype.forEach.call(compare, function (v) {
                          if (v.indexOf(value) !== -1) {
                            foundOne = true;
                          }
                        });
                      } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
                        // only "value" is Array
                        Array.prototype.forEach.call(value, function (v) {
                          if (compare.indexOf(v) !== -1) {
                            foundOne = true;
                          }
                        });
                      } else if (value === compare) {
                        // only none is Array
                        if (value.indexOf(compare) !== -1) {
                          foundOne = true;
                        }
                      }

                      if (foundOne) {
                        shouldAdd = false;
                      }
                    }

                    break;
                  default:
                    break;
                }
              } else {
                shouldAdd = false;
              }
            });
          } else {
            shouldAdd = false;
          }
        })();
      }

      return shouldAdd;
    }
  }]);

  return Sql;
}();

exports.default = Sql;