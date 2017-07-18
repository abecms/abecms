import path from 'path'
import {config, Manager} from '../../cli'

var middleware = function(req, res, next) {
  var port = process.env.LIVERELOAD_PORT || 35729

  if (req.url.indexOf('/abe/') > -1) {
    var send = res.send
    res.send = function(string) {
      if (typeof string === 'string' || string instanceof Buffer) {
        var body = string instanceof Buffer ? string.toString() : string
        body = body.replace(/<\/body>/g, function(w) {
          return (
            '<script src="/abecms/libs/livereload.js?snipver=1&host=localhost&port=' +
            port +
            '"></script>\n<script>document.addEventListener("LiveReloadDisconnect", function() {\nsetTimeout(function() {\nwindow.top.location.reload()\n}, 2000);\n})\n</script>' +
            w
          )
        })
        send.call(this, body)
      } else {
        send.call(this, string)
      }
    }
    next()
  } else {
    next()
  }
}

export default middleware
