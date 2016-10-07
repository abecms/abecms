import path from 'path'
import fse from 'fs-extra'

import {
  FileParser,
  coreUtils,
  config
} from '../../cli'

var route = function(req, res, next){
  var file = path.join(config.root, 'logs', `${req.params[0]}.log`)
  var html = ''
  if (coreUtils.file.exist(file)) {
    fse.removeSync(file)
    res.redirect('/abe/delete-logs/')
  }else {
    var pathDelete = path.join(config.root, 'logs')
    var files = FileParser.read(pathDelete, pathDelete, 'files', true, /\.log/, 99)

    html += '<a href="/abe/logs">Go to logs</a>'
    html += '<br /><br /><div>Choose to remove logs files</div>'
    html += '<ul>'
    Array.prototype.forEach.call(files, (item) => {
      html += '<li>'
      html += '<a href="/abe/delete-logs/' + item.cleanPath.replace(/\..+$/, '') + '">' + item.name + '</a><br />'
      html += '</li>'
    })
    html += '</ul>'
    res.send(html)
  }
}

export default route