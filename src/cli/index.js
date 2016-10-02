import moment from 'moment'
import fse from 'fs-extra'
import clc from 'cli-color'

import fileAttr from './cms/data/file-attr'
import Util from './core/utils/abe-utils'
import handlebarsHelperSlugify from 'handlebars-helper-slugify'

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

import Manager from './core/manager/Manager'
import Page from './models/Page'
import Handlebars from 'handlebars'

import {dateSlug, dateUnslug} from './core/utils/abe-date'
import Locales from './core/utils/abe-locales'
import FileParser from './core/utils/file-parser'
import fileUtils from './core/utils/file-utils'
import folderUtils from './core/utils/folder-utils'
import slugify from './core/utils/slugify'
import {cleanSlug} from './core/utils/slugify'

import {getTemplate} from './helpers/abe-template'
import Create from './Create'

import config from './core/config/config'

import {getAttr, getEnclosingTags, escapeTextToRegex} from './cms/data/regex-helper'
import removeDuplicateAttr from './cms/data/abe-remove-duplicate-attr'

import abeCreate from './helpers/abe-create'
import abeDuplicate from './helpers/abe-duplicate'
import Sql from './cms/data/abe-sql'

import {save, checkRequired, saveJson} from './controllers/Save'
import abeProcess from './extend/abe-process'
import Hooks from './extend/abe-hooks'
import Plugins from './extend/abe-plugins'


import getSelectTemplateKeys from './helpers/abe-get-select-template-keys'

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
}

export {compileAbe as compileAbe}
