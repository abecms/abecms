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
          console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *');
          console.log('fromMatch', fromMatch);
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

    // static sortByDateDesc(a, b) {
    //   var jsonA = FileParser.getJson(a.path)
    //   var jsonB = FileParser.getJson(b.path)
    //   let metaA = config.meta.name
    //   let metaB = config.meta.name

    //   var dateA = (jsonA[metaA]) ? new Date(jsonA[metaA].latest.date) : new Date()
    //   var dateB = (jsonB[metaB]) ? new Date(jsonB[metaB].latest.date) : new Date()
    //   if(dateA < dateB) {
    //     return 1
    //   }else if(dateA > dateB) {
    //     return -1
    //   }
    //   return 0
    // }

    // static sortByDateAsc(a, b) {
    //   // var jsonA = FileParser.getJson(a.path)
    //   // var jsonB = FileParser.getJson(b.path)
    //   // let metaA = config.meta.name
    //   // let metaB = config.meta.name
    //   var dateA = new Date(a.date)
    //   var dateB = new Date(b.date)
    //   if(dateA > dateB) {
    //     return 1
    //   }else if(dateA < dateB) {
    //     return -1
    //   }
    //   return 0
    // }

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
        Array.prototype.forEach.call(matches, function (matche) {
          res = res.replace(matche, '');
        });
      } else {
        res = res.replace('}}', '');
      }

      return res.substring(0, res.length - 1);
    }
  }, {
    key: 'getDataRequest',
    value: function getDataRequest(tplPath, match, jsonPage) {
      var request = Sql.handleSqlRequest((0, _.getAttr)(match, 'source'), jsonPage),
          limit = 0,
          res = [];

      var data = _.config.data.url;
      var files = [];

      if (typeof request.from !== 'undefined' && request.from !== null) {
        Array.prototype.forEach.call(request.from, function (from) {
          from = from.replace(/___abe_dot___/g, '.');
          from = from.replace(/___abe___/g, '/');
          var fromPath = '';
          if (from === '*' || from === '/') {
            fromPath = _.fileUtils.concatPath(_.config.root, data);
          } else if (from === './') {
            fromPath = _.fileUtils.concatPath(_.config.root, data, tplPath);
          } else if (from.indexOf('/') === 0) {
            fromPath = _.fileUtils.concatPath(_.config.root, data, from);
          } else if (from.indexOf('/') !== 0) {
            fromPath = _.fileUtils.concatPath(_.config.root, data, tplPath, from);
          }

          if (_.folderUtils.isFolder(fromPath)) {
            files = files.concat(_.FileParser.getFiles(fromPath, true, 99, /\.json/));
          }
        });
      } else {
        files = _.FileParser.getFiles(_.fileUtils.concatPath(_.config.root, data), true, 99, /\.json/);
      }

      if (typeof request.orderby !== 'undefined' && request.orderby !== null) {
        if (request.orderby.column.toLowerCase() === 'date') {
          if (request.orderby.type === 'ASC') {
            files.sort(Sql.sortByDateAsc);
          } else if (request.orderby.type === 'DESC') {
            files.sort(Sql.sortByDateDesc);
          }
        }
      }

      Array.prototype.forEach.call(files, function (file) {
        var shouldAdd = true;
        var folderPath = _.folderUtils.getFolderPath(file.path);
        var json;

        // remove not published file
        var attr = _.fileAttr.get(file.path);
        if (typeof attr.d !== 'undefined' && attr.d !== null) {
          return;
        }

        // check where
        if (typeof request.where !== 'undefined' && request.where !== null) {
          shouldAdd = Sql.reqWhere(file, request.where, jsonPage);
        }

        if (shouldAdd) {
          if (typeof json === 'undefined' || json === null) {
            json = JSON.parse(JSON.stringify(_.FileParser.getJson(file.path)));
          }
          var jsonValues = {};

          if (typeof request.columns !== 'undefined' && request.columns !== null && request.columns.length > 0 && request.columns[0] !== '*') {

            Array.prototype.forEach.call(request.columns, function (column) {
              if (typeof json[column] !== 'undefined' && json[column] !== null) {
                jsonValues[column] = json[column];
              }
            });
            jsonValues[_.config.meta.name] = json[_.config.meta.name];
          } else {
            jsonValues = json;
          }

          if (limit < request.limit || request.limit === -1) {
            res.push(jsonValues);
          }
          limit++;
        }
      });

      return res;
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
    key: 'reqWhere',
    value: function reqWhere(file, wheres, jsonPage) {
      var shouldAdd = true;
      var json = {};
      if (_.fileUtils.isFile(file.path)) {
        json = _fsExtra2.default.readJsonSync(file.path);
      }
      var meta = _.config.meta.name;

      if (typeof json[meta] !== 'undefined' && json[meta] !== null) {
        var template = _.FileParser.getTemplate(json[meta].template);
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

      return shouldAdd;
    }
  }]);

  return Sql;
}();

exports.default = Sql;