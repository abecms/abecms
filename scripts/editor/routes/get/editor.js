'use strict';

var fs = require('fs');
var path = require('path');

var route = function route(req, res, next, abe) {
  // Standalone page editor (CodePen-style). Direct navigation loads its own assets;
  // in admin, use /abe/editor/ and the preview iframe instead.
  if (req.query.embed !== '1' && req.get('Sec-Fetch-Dest') === 'document') {
    res.redirect('/abe/editor/')
    return
  }

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