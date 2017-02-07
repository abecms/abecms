import fs from 'fs-extra'
import path from 'path'

import {
  coreUtils,
  config,
  Handlebars
} from '../../../../cli'

var route = function route(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.app.on("generate-posts", function(data) {
    res.write('data: {\n');
    var i = 0
    var size = Object.keys(data).length
    Array.prototype.forEach.call(Object.keys(data), (key) => {
      i++
      if (size == i) {
        res.write('data: "' + key + '": "' + data[key] + '"\n');
      }else {
        res.write('data: "' + key + '": "' + data[key] + '",\n');
      }
    })
    res.write('data: }\n\n');
  })

  res.write('data: {\n');
  res.write(`data: "msg": "open"\n`);
  res.write('data: }\n\n');
}

export default route