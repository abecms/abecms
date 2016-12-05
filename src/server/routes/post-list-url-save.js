import {
  config
} from '../../cli'

var route = function(req, res) {
  
  var authorizations = req.body

  let json = config.getLocalConfig()

  Array.prototype.forEach.call(Object.keys(authorizations), (key) => {
    if (key != 'admin') {
      json.users.routes[key] = authorizations[key]
    }
  })

  config.users.routes = json.users.routes
  config.save(json)

  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify({
    success: 1,
    message: 'config saved'
  }))
}

export default route