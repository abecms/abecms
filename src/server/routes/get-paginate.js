import {
  config,
  abeExtend,
  Manager
} from '../../cli'

var route = function(req, res, next){
  var start = 0
  var length = 25
  var sortField = 'date'
  var sortOrder = -1
  var search = ''
  
  var values = ['date', 'abe_meta.link', 'abe_meta.template', 'date']
  Array.prototype.forEach.call(config.users.workflow, (flow) => {
    values[i] = 'abe_meta.' + flow
    ++i
  })

  abeExtend.hooks.instance.trigger('beforeRoute', req, res, next)
  if(typeof res._header !== 'undefined' && res._header !== null) return

  if (typeof req.query.start !== 'undefined') {
    start = +req.query.start
  }

  if (typeof req.query.length !== 'undefined') {
    length = +req.query.length
  }

  var i = 4
  if (typeof req.query.order !== 'undefined') {
    sortField = values[req.query.order[0]['column']]
    sortOrder = (req.query.order[0]['dir'] === 'desc')? -1:1
  }

  if (typeof req.query.search !== 'undefined' && req.query.search.value !== '') {
    search = req.query.search.value
  }

  var list = Manager.instance.getPage(start, length, sortField, sortOrder, search)

  if (typeof req.query.draw !== 'undefined') {
    list['draw'] = req.query.draw
  }

  res.set('Content-Type', 'application/json')
  res.send(JSON.stringify(list))
}

export default route
