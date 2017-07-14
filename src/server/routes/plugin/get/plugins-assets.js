import fs from 'fs-extra'
import path from 'path'

import {
  abeExtend,
  config,
} from '../../../../cli'

var route = function route(req, res) {
  if (typeof req.params !== 'undefined' && req.params[0].length > 0) {
    var pluginUrl = req.params[0]
    var pluginPath = pluginUrl.split('/')
    var pluginLocation = abeExtend.plugins.instance.getPluginLocation(pluginPath[0])
    if (pluginLocation) {
    	var pluginFilePath = path.join(pluginPath.shift(), 'partials', ...pluginPath)
    	res.sendFile(pluginFilePath, {root: path.join(config.root, pluginLocation)})
    } else {
    	res.status(404).send('Plugin Not found')
    }
  } else {
      res.status(404).send('Not found')
  }
}

export default route