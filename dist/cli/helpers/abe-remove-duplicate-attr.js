'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = removeDuplicateAttr;

var _cli = require('../../cli');

function recurseDeleteKey(currentLevel, arrayKeyAttr) {
  var currentArray = arrayKeyAttr.slice(0);

  if (arrayKeyAttr.length === 1) {
    delete currentLevel[arrayKeyAttr[0]];
  }

  Array.prototype.forEach.call(currentArray, function (key) {
    if (typeof currentLevel[key] !== 'undefined' && currentLevel[key] !== null) {
      currentLevel = currentLevel[key];
      currentArray.shift();
      recurseDeleteKey(currentLevel, currentArray);
      if ((typeof currentLevel === 'undefined' ? 'undefined' : _typeof(currentLevel)) === 'object' && Object.prototype.toString.call(currentLevel) === '[object Array]') {
        Array.prototype.forEach.call(currentLevel, function (item) {
          recurseDeleteKey(item, currentArray);
        });
      } else {
        recurseDeleteKey(currentLevel, currentArray);
      }
    }
  });
}

function removeDuplicateAttr(text, json) {
  var regAbe = /{{abe[\S\s].*?duplicate=['|"]([\S\s].*?['|"| ]}})/g;
  var matches = text.match(regAbe);
  var requiredValue = 0;
  var complete = 0;
  if (typeof matches !== 'undefined' && matches !== null) {

    Array.prototype.forEach.call(matches, function (match) {
      var keyAttr = (0, _cli.getAttr)(match, 'key');

      if (typeof match !== 'undefined' && match !== null) {
        var arrayKeyAttr = keyAttr.split('.');
        recurseDeleteKey(json, arrayKeyAttr);
      }
    });
  }

  return json;
}