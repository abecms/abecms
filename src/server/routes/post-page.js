import {
  Hooks
} from '../../cli'

import pageHelper from '../helpers/page'

var route = function(req, res, next) {
  Hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return;

  pageHelper(req, res, next, true)
}

export default route