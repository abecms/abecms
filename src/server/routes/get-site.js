import {
  serveSite,
  config,
  Hooks
} from '../../cli'

var site = new serveSite()

var route = function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  if(!site.isStarted) site.start(config)
  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(site.infos))
}

export default route