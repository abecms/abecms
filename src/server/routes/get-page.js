import {
  abeExtend
} from '../../cli'

import pageHelper from '../helpers/page'

var route = function(req, res, next) {
  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  pageHelper(req, res, next)
}

export default route