'use strict';

var route = function route(req, res, next, abe) {
  abe.Hooks.instance.trigger('beforeRoute', req, res, next);
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  var htmlToSend = '';
  var request = '{{abe type="data" key="results" source="' + req.body.select.replace() + '"}}';
  var json = req.body.json
  var sourceAttr = abe.config.source.name

  if(typeof json !== 'undefined' && json !== null
    && json !== '') {
    json = JSON.parse(json)
  }else {
    json = {}
  }

  var result = abe.Util.getDataList(
    req.body.path,
    request,
    json
  )

  var login = abe.fileUtils.concatPath(__dirname + '/../../partials/data.html')
  var html = abe.fileUtils.getFileContent(login);

  var template = abe.Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    express: {
      req: req,
      res: res
    },
    path: req.body.path,
    select: req.body.select,
    json: req.body.json,
    result: json[sourceAttr]['results'],
    request: request
  })
  
  return res.send(tmp);
}

exports.default = route