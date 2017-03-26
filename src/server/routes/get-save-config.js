import {
  config,
  abeExtend
} from '../../cli'

/**
 * This route saves the config en returns result as JSON
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var route = function(req, res, next){
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  config.save(req.query.json)
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(req.query.json))
}

export default route