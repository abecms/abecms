import {abeExtend} from '../../cli'

var eventOnGeneratePost = function(data) {
  this.write('data: {\n')
  var i = 0
  var size = Object.keys(data).length
  Array.prototype.forEach.call(Object.keys(data), key => {
    i++
    if (size == i) {
      this.write('data: "' + key + '": "' + data[key] + '"\n')
    } else {
      this.write('data: "' + key + '": "' + data[key] + '",\n')
    }
  })
  this.write('data: }\n\n')
}

var count = 0
var route = function(req, res) {
  // if event-stream
  if (req.accepts('text/event-stream')) {
    // Approximately 24 days...
    req.socket.setTimeout(0x7fffffff)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    })

    let evt = eventOnGeneratePost.bind(res)
    res.app.on('generate-posts', evt)

    res.write('data: {\n')
    res.write('data: "msg": "open"\n')
    res.write('data: }\n\n')

    req.connection.addListener(
      'close',
      function() {
        res.app.removeListener('generate-posts', evt)
      },
      false
    )
  } else {
    // if get
    var result
    var proc = abeExtend.process('generate-posts', [''], data => {
      res.app.emit('generate-posts', data)
    })
    if (proc) {
      res.app.emit('generate-posts', {percent: 0, time: '00:00sec'})
      result = {
        success: 1,
        msg: 'generate-posts is running'
      }
    } else {
      result = {
        success: 0,
        msg:
          'cannot run process generate-posts, because an other one is already running'
      }
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }
}

export default route
