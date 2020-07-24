import Handlebars from 'handlebars'
import HandlebarsIntl from 'handlebars-intl'
import handlebarsHelperSlugify from 'handlebars-helper-slugify'
import markdown from 'helper-markdown'

/* Handlebar utilities */
import attrAbe from './handlebars/attrAbe'
import className from './handlebars/className'
import cleanTab from './handlebars/cleanTab'
import ifCond from './handlebars/ifCond'
import ifIn from './handlebars/ifIn'
import isTrue from './handlebars/isTrue'
import eachGroup from './handlebars/eachGroup'
import math from './handlebars/math'
import moduloIf from './handlebars/moduloIf'
import notEmpty from './handlebars/notEmpty'
import printJson from './handlebars/printJson'
import translate from './handlebars/translate'
import times from './handlebars/times'
import lowercase from './handlebars/lowercase'
import uppercase from './handlebars/uppercase'
import setVariable from './handlebars/setVariable'
import isAuthorized from './handlebars/isAuthorized'
import concat from './handlebars/concat'
import getCurrentuserRole from './handlebars/getCurrentuserRole'

import * as template from './template'
import * as prepare from './prepare'
import * as assets from './assets'
import encodeAbeTagAsComment from './encodeAbeTagAsComment'
import insertDebugtoolUtilities from './insertDebugtoolUtilities'

/* Register utilities */
require('handlebars-helpers')({
  handlebars: Handlebars
});
Handlebars.registerHelper('markdown', markdown())
Handlebars.registerHelper('attrAbe', attrAbe)
Handlebars.registerHelper('className', className)
Handlebars.registerHelper('cleanTab', cleanTab)
Handlebars.registerHelper(
  'slugify',
  handlebarsHelperSlugify({Handlebars: Handlebars}).slugify
)
Handlebars.registerHelper('ifCond', ifCond)
Handlebars.registerHelper('ifIn', ifIn)
Handlebars.registerHelper('isTrue', isTrue)
Handlebars.registerHelper('eachGroup', eachGroup)
Handlebars.registerHelper('math', math)
Handlebars.registerHelper('moduloIf', moduloIf)
Handlebars.registerHelper('notEmpty', notEmpty)
Handlebars.registerHelper('printJson', printJson)
Handlebars.registerHelper('i18nAbe', translate)
Handlebars.registerHelper('times', times)
Handlebars.registerHelper('lowercase', lowercase)
Handlebars.registerHelper('uppercase', uppercase)
Handlebars.registerHelper('setVariable', setVariable)
Handlebars.registerHelper('isAuthorized', isAuthorized)
Handlebars.registerHelper('concat', concat)
Handlebars.registerHelper('getCurrentuserRole', getCurrentuserRole)

HandlebarsIntl.registerWith(Handlebars)

export {
  Handlebars,
  template,
  prepare,
  assets,
  encodeAbeTagAsComment,
  insertDebugtoolUtilities,
  attrAbe,
  className,
  cleanTab,
  ifCond,
  ifIn,
  isTrue,
  eachGroup,
  lowercase,
  uppercase,
  setVariable,
  isAuthorized,
  concat,
  getCurrentuserRole,
  math,
  moduloIf,
  notEmpty,
  printJson,
  translate,
  times
}
