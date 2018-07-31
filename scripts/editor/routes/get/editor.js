'use strict';

var fs = require('fs');
var path = require('path');

var route = function route(req, res, next, abe) {
  var pathFile = path.join(__dirname + '/../../partials/editor.html')
  var html = abe.coreUtils.file.getContent(pathFile);
  var template = abe.Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    manager: {config: JSON.stringify(abe.config)},
    config: abe.config,
    user: res.user,
    isPageEditor: true
  })
  res.send(tmp);

  return 
}

exports.default = route