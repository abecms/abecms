import path from 'path'
import fse from 'fs-extra'
import Handlebars from 'handlebars'
import {
  abeExtend
  ,coreUtils
  ,config
} from '../../cli'

var route = function(req, res, next) {
  
  var authorizations = req.body

  let json = config.getLocalConfig()

  Array.prototype.forEach.call(Object.keys(authorizations), (key) => {
  	if (key != 'admin') {
  		json.users.routes[key] = authorizations[key]
  	}
  })

  config.save(json)

  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({
    success: 1,
    message: 'config saved'
  }))
}

export default route