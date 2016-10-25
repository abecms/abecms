import {
  abeExtend
} from '../../cli'

var route = function(req, res) {
  var result
  if (abeExtend.process('publish-all', [''])) {
	  result = {
	    success: 1,
	    msg: 'publish all is running'
	  }
  }else {
  	result = {
	    success: 0,
	    msg: 'cannot run process sitemap, because an other one is already running'
	  }
  }
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(result))
}

export default route