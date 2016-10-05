import Handlebars from 'handlebars'
import moment from 'moment'
import fse from 'fs-extra'
import clc from 'cli-color'

import Util from './core/utils/abe-utils'
import handlebarsHelperSlugify from 'handlebars-helper-slugify'

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
	isTrue,
	truncate
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

import {dateSlug, dateUnslug} from './core/utils/abe-date'
import Locales from './core/utils/abe-locales'
import FileParser from './core/utils/file-parser'
import fileUtils from './core/utils/file-utils'
import folderUtils from './core/utils/folder-utils'
import slugify from './core/utils/slugify'
import {cleanSlug} from './core/utils/slugify'

// import {getTemplate} from './cms/templates/abe-template'
import Create from './cms/Create'

import config from './core/config/config'

import abeProcess from './extend/abe-process'
import Hooks from './extend/abe-hooks'
import Plugins from './extend/abe-plugins'

import * as cmsData from './cms/data'
import * as cmsOperations from './cms/operations'
import * as cmsTemplate from './cms/templates'
import * as coreUtils from './core/utils'

export {
	cmsData
	,cmsOperations
	,cmsTemplate
	,coreUtils

	,moment
	,fse
	,Handlebars
	,clc
	,Util
	,slugify
	,cleanSlug
	,FileParser
	,folderUtils
	,fileUtils
	,printInput
	,abeImport
	,math
	,Create
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
	,config
	,Hooks
	,Plugins
	,Locales
	,dateSlug
	,dateUnslug
	,Manager
	,Page
}

export {compileAbe as compileAbe}
