'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prepend(value, array) {
  var newArray = array.slice(0);
  newArray.unshift(value);
  return newArray;
}

var abeProcess = function abeProcess(name, args) {
  args = prepend('ABE_WEBSITE=' + _.config.root, args);
  var publishAll = _child_process2.default.fork(__dirname + '/../../cli/process/' + name + '.js', args);
};

exports.default = abeProcess;