import {
  abeExtend
} from '../../cli'

var route = function(req, res) {
  var result
  var proc = abeExtend.process('generate-posts', [''], (data) => {
    res.app.emit("generate-posts", data)
  })
  if (proc) {
    res.app.emit("generate-posts", {percent: 0, time: "00:00sec"})
    result = {
      success: 1,
      msg: 'generate-posts is running'
    }
  }else {
    result = {
      success: 0,
      msg: 'cannot run process generate-posts, because an other one is already running'
    }
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route