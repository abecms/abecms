import {config, abeExtend, Manager} from '../../../cli'

/**
 * This route returns filtered list of posts in JSON format
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var route = function(req, res, next) {
  var start = 0
  var length = 25
  var sortField = 'date'
  var sortOrder = -1
  var search = ''
  var searchfields = ['abe_meta.link', 'abe_meta.template', 'name']
  var i = 4
  var values = ['date', 'abe_meta.link', 'abe_meta.template', 'date']
  Array.prototype.forEach.call(config.users.workflow, flow => {
    values[i] = 'abe_meta.' + flow
    ++i
  })

  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if (typeof res._header !== 'undefined' && res._header !== null) return

  if (typeof req.query.start !== 'undefined') {
    start = +req.query.start
  }

  if (typeof req.query.length !== 'undefined') {
    length = +req.query.length
  }

  if (typeof req.query.order !== 'undefined') {
    sortField = req.query.orderfield
    sortOrder = req.query.order === 'desc' ? -1 : 1
  }

  if (
    typeof req.query.search !== 'undefined' &&
    req.query.search !== ''
  ) {
    search = req.query.search
  }

  if (
    typeof req.query.searchfields !== 'undefined' &&
    req.query.searchfields !== ''
  ) {
    searchfields = req.query.searchfields.split(',');
  }

  var list = Manager.instance.getPage(
    start,
    length,
    sortField,
    sortOrder,
    search,
    searchfields
  )

  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(list))
}

export default route
