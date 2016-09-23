'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;
exports.get = get;

var _redis = require('redis');

var _redis2 = _interopRequireDefault(_redis);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var state = {
  db: null
};

function connect(port, host) {
  state.db = _redis2.default.createClient(port, host);
  state.db.on('connect', function () {
    console.log('connected to Redis');
  });
  state.db.on('error', function (err) {
    console.log('Error connecting to Redis:' + err);
  });
}

function get() {
  return state.db;
}