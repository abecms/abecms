'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addWorkflow;

var _ = require('../../');

function addWorkflow(flows, userFlow, currentFlow, text) {
  var res = _.Hooks.instance.trigger('beforeAddWorkflow', flows, userFlow, currentFlow, text);
  var displayFlow = 'draft';
  flows = ['draft'].concat(flows);
  flows = flows.concat('publish');

  var foundFlow = false;
  var keepGoing = true;
  var hasReject = false;
  var i = 0;

  if (currentFlow === 'draft') {
    res += '<button class=\'btn btn-info btn-save btn-hidden\' data-action="draft">\n            <span class="before">\n              ' + text.save + '\n            </span>\n            <span class="loading">\n              ' + text.saving + '\n            </span>\n            <span class="after">\n              ' + text.done + '\n            </span>\n          </button>';
  }

  flows.forEach(function (flow) {
    if (!keepGoing) return;

    if (userFlow.workflow.indexOf(flow) > -1 && flow !== 'draft') {
      displayFlow = foundFlow ? flow : 'reject';

      if (displayFlow !== 'reject' && currentFlow !== flow || !hasReject && displayFlow === 'reject') {
        res += '<button class=\'btn btn-info btn-save\' data-action="' + displayFlow + '">\n                  <span class="before">\n                    ' + displayFlow + '\n                  </span>\n                  <span class="loading">\n                    ' + text.saving + '\n                  </span>\n                  <span class="after">\n                    ' + text.done + '\n                  </span>\n                </button>';
      }
      if (foundFlow) keepGoing = false;
      if (displayFlow === 'reject') hasReject = true;
    }

    if (currentFlow === flow || userFlow.index == i++) foundFlow = true;
  });

  if (/data-action/g.test(res) && res.match(/data-action/g).length === 1 && /data-action="reject"/g.test(res)) {
    res = res.replace(/<span class="before">(\r|\t|\n|.)*?<\/span>/, '<span class="before">edit<\/span>');
  }

  res += _.Hooks.instance.trigger('afterAddWorkflow', flows, userFlow, currentFlow, text);

  return res;
}