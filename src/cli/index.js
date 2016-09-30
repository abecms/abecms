import fileAttr from './helpers/file-attr'
import Util from './helpers/abe-utils'
import handlebarsHelperSlugify from 'handlebars-helper-slugify'
import moment from 'moment'
import fse from 'fs-extra'
import clc from 'cli-color'

import {
	abeImport,
	printInput,
	testObj,
	translate,
	cleanTab,
	math,
	printBlock,
	notEmpty,
	printJson,
	className,
	listPage,
	moduloIf,
	abeEngine,
	compileAbe,
	attrAbe,
	folders,
	printConfig,
	ifIn,
	ifCond
} from './handlebars/index'

import Manager from './models/Manager'
import Page from './models/Page'
import Handlebars from 'handlebars'
import {getAttr, getEnclosingTags, escapeTextToRegex} from './helpers/regex-helper'
import slugify from './helpers/slugify'
import {dateSlug, dateUnslug} from './helpers/abe-date'
import {cleanSlug} from './helpers/slugify'
import {getTemplate} from './helpers/abe-template'
import folderUtils from './helpers/folder-utils'
import FileParser from './helpers/file-parser'
import Create from './Create'
import fileUtils from './helpers/file-utils'
import config from './helpers/abe-config'
import log from './helpers/abe-logs'
import removeDuplicateAttr from './helpers/abe-remove-duplicate-attr'
import abeCreate from './helpers/abe-create'
import abeDuplicate from './helpers/abe-duplicate'
import Sql from './helpers/abe-sql'
import abeProcess from './helpers/abe-process'
import {save, checkRequired, saveJson} from './controllers/Save'
import Hooks from './helpers/abe-hooks'
import Plugins from './helpers/abe-plugins'
import Locales from './helpers/abe-locales'

import getSelectTemplateKeys from './helpers/abe-get-select-template-keys'
import TimeMesure from './helpers/abe-time-mesure'

export {
	fileAttr
	,moment
	,fse
	,Handlebars
	,clc
	,Util
	,abeCreate
	,abeDuplicate
	,slugify
	,cleanSlug
	,FileParser
	,folderUtils
	,fileUtils
	,printInput
	,abeImport
	,math
	,testObj
	,Create
	,Sql
	,abeProcess
	,translate
	,printBlock
	,notEmpty
	,printJson
	,className
	,moduloIf
	,listPage
	,abeEngine
	,attrAbe
	,folders
	,cleanTab
	,printConfig
	,ifIn
	,ifCond
	,getAttr
	,getEnclosingTags
	,escapeTextToRegex
	,config
	,getTemplate
	,log
	,removeDuplicateAttr
	,save
	,Hooks
	,Plugins
	,Locales
	,checkRequired
	,saveJson
	,dateSlug
	,dateUnslug
	,Manager
	,Page
	,getSelectTemplateKeys
	,TimeMesure
}

export {compileAbe as compileAbe}
