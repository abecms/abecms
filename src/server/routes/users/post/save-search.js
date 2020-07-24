import {User} from '../../../../cli'

var route = function(req, res) {
  if(req.body.title != null && req.body.title != null != '' && req.body.search != null && req.body.search != '') {
    User.operations.saveSearch(req.body.id, {"title": req.body.title, "search": req.body.search})
    return res.status(200).json({success: 1})
  }

  return res.status(200).json({success: 0})
}

export default route
