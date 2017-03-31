import {
  abeExtend,
  Manager
} from '../../../cli'

var eventOnActivity = function(data) {
  var activities = Manager.instance.getActivities()
  this.write('data: {\n')
  var i = 0
  var size = Object.keys(data).length
  this.write('data: "id": "' + activities.length + '",\n')
  Array.prototype.forEach.call(Object.keys(data), (key) => {
    i++
    if (size == i) {
      this.write('data: "' + key + '": "' + data[key] + '"\n')
    }else {
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
    req.socket.setTimeout(0x7FFFFFFF);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    let evt = eventOnActivity.bind(res)
    Manager.instance.events.activity.on("activity-stream", evt)

    if (!req.headers['last-event-id']) {
      var activities = Manager.instance.getActivities()
      var j = 0
      if(activities.length > 0){
        Array.prototype.forEach.call(activities, (activity) => {
          var jsonActivity = JSON.parse(JSON.stringify(activity))
          j++
          var i = 0
          var size = Object.keys(jsonActivity).length
          res.write('data: {\n')
          res.write('data: "id": "' + j + '",\n')
          Array.prototype.forEach.call(Object.keys(jsonActivity), (key) => {
            i++
            if (size == i) {
              res.write('data: "' + key + '": "' + jsonActivity[key] + '"\n')
            }else {
              res.write('data: "' + key + '": "' + jsonActivity[key] + '",\n')
            }
          })
          res.write('data: }\n\n')
        })
      } else {
        res.write('data: {\n')
        res.write(`data: "msg": "open"\n`)
        res.write('data: }\n\n')
      }
    } else {
      res.write('data: {\n')
      res.write(`data: "msg": "open"\n`)
      res.write('data: }\n\n')
    }

    Manager.instance.addConnection(res)

    req.connection.addListener("close", function () {
      res.app.removeListener("activity-stream", evt)
      Manager.instance.removeConnection(res)
    }, false);

  } else { // if get
    var result = {
      success: 0,
      msg: 'no event-stream configured'
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
  }
}

export default route