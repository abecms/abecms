'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ = require('../');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var User = function () {
  function User(session, query) {
    _classCallCheck(this, User);

    if (typeof query.role !== 'undefined' && query.role !== null) session.role = query.role;else if (!session.role) session.role = 'admin';

    this._role = session.role;
    this._allowed = this.setAllowed();
  }

  _createClass(User, [{
    key: 'setAllowed',
    value: function setAllowed() {
      var _this = this;

      var allowed = {
        actions: [],
        workflow: []
      };
      _.config.actions.forEach(function (action) {
        var userActions = _.config["roles"][_this._role]["actions"];
        if (userActions === '*' || userActions.indexOf(action) > -1) allowed["actions"][action] = 1;
      });
      var nb = 0;
      var configWorkflow = ['draft'].concat(_.config.workflow);
      var userFlow = _.config["roles"][this._role]["workflow"];
      configWorkflow.push('publish');
      var foundFlow = false;

      configWorkflow.forEach(function (flow) {
        if (userFlow === '*' || flow === userFlow) allowed["workflow_index"] = ++nb;
        if (userFlow === '*') allowed["workflow"].push(flow);else if (!foundFlow) allowed["workflow"].push(flow);
        if (flow === userFlow) foundFlow = true;
      });

      return allowed;
    }
  }, {
    key: 'actions',
    get: function get() {
      return this._allowed['actions'];
    }
  }, {
    key: 'workflow',
    get: function get() {
      return this._allowed['workflow'];
    }
  }, {
    key: 'workflowIndex',
    get: function get() {
      return this._allowed['workflow_index'];
    }
  }, {
    key: 'role',
    get: function get() {
      return this._role;
    }
  }, {
    key: 'infos',
    set: function set(role) {
      this._role = role;
    }
  }]);

  return User;
}();

exports.default = User;