import path from 'path'
import fse from 'fs-extra'
import Handlebars from 'handlebars'
import {
  abeExtend
  ,coreUtils
  ,config
} from '../../cli'

var route = function(req, res, next) {
  
  var authorizations = req.body
  delete authorizations.admin

  config.user
  console.log('* * * * * * * * * * * * * * * * * * * * * * * * * * * * *')
  console.log('authorizations', authorizations)
}

export default route