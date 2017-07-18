import {cmsThemes} from '../../cli'

var route = function(req, res) {
  if (typeof res._header !== 'undefined' && res._header !== null) return

  if (req.body.zipUrl != null) {
    cmsThemes.themes
      .downloadTheme(req.body.zipUrl)
      .then(function(resp) {
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify(resp))
      })
      .catch(function(e) {
        res.set('Content-Type', 'application/json')
        res.send(JSON.stringify({error: 1}))
      })
  } else {
    if (req.body.delete != null) cmsThemes.themes.deleteTheme()
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify({success: 1}))
  }
}

export default route
