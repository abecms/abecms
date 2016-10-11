import {
  abeExtend
} from '../../cli'

var route = function(req, res) {
  abeExtend.process('publish-all', [''])

  var result = {
    success: 1
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route