import paperboy from 'paperboy'
import http from 'http'
import path from 'path'
import fse from 'fs-extra'
import Handlebars from 'handlebars'

import {
  Util,
  FileParser,
  fileUtils,
  fileAttr,
  cli,
  log,
  Page
} from '../'

export default class ServeSite {

  constructor(){}

  start(config){
    this.config = config
    this.webroot = fileUtils.concatPath(config.root, config.publish.url)
    if(config.siteUrl) {
      this.webroot = config.siteUrl
      this.port = config.sitePort ? config.sitePort : 80
      this._server = true
      return;
    }
    this.port = config.webport
    this._server = null

    this._server = http.createServer((req, res) => {
      var ip = req.connection.remoteAddress
      paperboy
        .deliver(this.webroot, req, res)
        .addHeader('X-Powered-By', 'Abe')
        .before(() => {
          console.log('Request received for ' + req.url)
        })
        .after((statusCode) => {
          console.log(statusCode + ' - ' + req.url + ' ' + ip)
        })
        .error((statusCode, msg) => {
          console.log([statusCode, msg, req.url, ip].join(' '))
          res.writeHead(statusCode, { 'Content-Type': 'text/plain' })
          res.end('Error [' + statusCode + ']')
        })
        .otherwise((err) => {
          console.log(__dirname + '/../../server/views/list.html')
          var text = fse.readFileSync(__dirname + '/../../server/views/list.html', 'utf8')
          var files = FileParser.getFiles(this.webroot, true, 10, new RegExp('.' + this.config.files.templates.extension))
          var template = Handlebars.compile(text)
          var compiled = template({files: files})

          res.writeHead(200, {'Content-Type': 'text/html'})
          res.end(compiled)
        })
    }).listen(this.port)

    console.log('paperboy on his round at http://localhost:' + this.port)
  }

  get server(){
    return this._server
  }

  get isStarted(){
    return typeof this._server !== 'undefined' && this._server !== null
  }

  get infos(){
    return {
      webroot: this.webroot === fileUtils.concatPath(this.config.root, this.config.publish.url) ? 'http://localhost' : this.config.siteUrl,
      port: this.port
    }
  }

}
