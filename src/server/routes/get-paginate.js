import {
  abeExtend,
  cmsOperations,
  Manager
} from '../../cli'

var route = function(req, res, next){
  var currentPage = 1
  var pageSize = 2
  var sortField = 'date'
  var sortOrder = -1

  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  if (typeof req.query.page !== 'undefined') {
    currentPage = +req.query.page
  }
  if (typeof req.query.pageSize !== 'undefined') {
    pageSize = +req.query.pageSize
  }
  if (typeof req.query.sortField !== 'undefined') {
    sortField = req.query.sortField
  }
  if (typeof req.query.sortOrder !== 'undefined') {
    sortOrder = +req.query.sortOrder
  }
  var page = Manager.instance.getPage(currentPage, pageSize, sortField, sortOrder)

  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(page))
}

export default route