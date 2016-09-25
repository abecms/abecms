import {
  abeProcess
} from '../../cli'

var route = function(req, res, next) {
    abeProcess('publish-all', [''])

    var result = {
        success: 1
    }
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify(result))
}

export default route