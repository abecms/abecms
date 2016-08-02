'use strict';


function render(req, res, next, abe) {

  var htmlToSend = '';

  var login = abe.fileUtils.concatPath(__dirname + '/../../partials/multiply.html')
  var html = abe.fileUtils.getFileContent(login);

  var result = abe.FileParser.getAllFiles()

  var template = abe.Handlebars.compile(html, {noEscape: true})
  var tmp = template({
    express: {
      req: req,
      res: res
    },
    result: result
  })
  
  return res.send(tmp);
}

var route = function route(req, res, next, abe) {
  abe.Hooks.instance.trigger('beforeRoute', req, res, next);
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  if(typeof req.query.tplName !== 'undefined' && req.query.tplName !== null
    && typeof req.query.filePath !== 'undefined' && req.query.filePath !== null
    && typeof req.query.selectTemplate !== 'undefined' && req.query.selectTemplate !== null
    && typeof req.query.number !== 'undefined' && req.query.number !== null) {
    var tplName = req.query.tplName;
    var filePath = abe.fileUtils.removeLast(req.query.filePath);
    var oldFilePath = req.query.filePath;
    var selectTemplate = req.query.selectTemplate;
    var number = parseInt(req.query.number);
    var start = 1;
    var promises = [];
    var notFound = false;
    var filesToPublish = [];

    while (!notFound) {
      var newTplName = abe.fileUtils.removeExtension(tplName) + '-' + start + '.' + abe.config.files.templates.extension
      newTplName = abe.fileUtils.concatPath(abe.config.root, abe.config.publish.url, newTplName)
      if (!abe.fileUtils.isFile(newTplName)) {
        number = number + start;
        notFound = true;
      }else {
        start++
      }
    }

    for (var i = start; i <= number; i++) {
      var newTplName = abe.fileUtils.removeExtension(tplName) + '-' + i + '.' + abe.config.files.templates.extension
      var p = abe.abeDuplicate(oldFilePath, selectTemplate, filePath, newTplName, req)

      let scopeOldFilePath = oldFilePath,
          scopeSelectTemplate = selectTemplate,
          scopeFilePath = filePath,
          scopeNewTplName = newTplName,
          scopeReq = req,
          pos = i

      p.then(function(e) {
        var j = e

        Array.prototype.forEach.call(Object.keys(j), function(key) {
          if (typeof(j[key]) === 'string') {
            j[key] = j[key] + ' ' + pos
          }
        })

        filesToPublish.push({
          oldFilePath: scopeOldFilePath,
          selectTemplate: scopeSelectTemplate,
          filePath: scopeFilePath + '/' + scopeNewTplName,
          newTplName: scopeNewTplName,
          json: e
        })
      }.bind(this))
      promises.push(p)
    }

    Promise.all(promises)
      .then(function() {

        var promisesSave = [];
        Array.prototype.forEach.call(filesToPublish, function(file) {
          
          var pSave = abe.save(
            abe.fileUtils.getFilePath(file.filePath),
            file.selectTemplate,
            file.json,
            '',
            'publish',
            null,
            'publish')

          promisesSave.push(pSave)
        
        })

        Promise.all(promisesSave)
          .then(function() {
            render(req, res, next, abe);
          }.bind(this)).catch(function(e) {
            console.error(e);
            render(req, res, next, abe);
          }.bind(this))

      }.bind(this)).catch(function(e) {
        console.error(e);
        render(req, res, next, abe);
      }.bind(this))
  }else {
    render(req, res, next, abe);
  }
}

exports.default = route