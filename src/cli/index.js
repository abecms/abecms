import Handlebars from 'handlebars'
import moment from 'moment'
import fs from 'fs'
import mkdirp from 'mkdirp'
import clc from 'cli-color'

import {
  translate,
  cleanTab,
  math,
  notEmpty,
  printJson,
  className,
  moduloIf,
  attrAbe,
  ifIn,
  ifCond,
  isAuthorized
} from './cms/templates/index'

import {
  abeImport,
  printBlock,
  printInput,
  listPage,
  abeEngine,
  compileAbe,
  folders,
  printConfig
} from './cms/editor/index'

import Manager from './core/manager/Manager'
import Page from './cms/Page'

import config from './core/config/config'
import * as mongo from './core/database/mongo'

import * as cmsData from './cms/data'
import * as cmsEditor from './cms/editor'
import * as cmsOperations from './cms/operations'
import * as cmsTemplates from './cms/templates'
import * as cmsReference from './cms/reference'
import * as cmsStructure from './cms/structure'
import * as cmsThemes from './cms/themes'
import * as cmsMedia from './cms/media'
import * as coreUtils from './core/utils'
import * as abeExtend from './extend'
import * as User from './users'

export {
  cmsData,
  cmsOperations,
  cmsTemplates,
  cmsReference,
  cmsStructure,
  cmsThemes,
  cmsMedia,
  coreUtils,
  cmsEditor,
  abeExtend,
  mkdirp,
  moment,
  fs,
  Handlebars,
  clc,
  printInput,
  isAuthorized,
  abeImport,
  math,
  translate,
  printBlock,
  notEmpty,
  printJson,
  className,
  moduloIf,
  listPage,
  abeEngine,
  attrAbe,
  folders,
  cleanTab,
  printConfig,
  ifIn,
  ifCond,
  config,
  mongo,
  Manager,
  Page,
  User
}

export {compileAbe}
