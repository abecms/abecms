import Handlebars from 'handlebars'
import moment from 'moment'
import fse from 'fs-extra'
import mkdirp from 'mkdirp'
import clc from 'cli-color'

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

import FileParser from './core/utils/file-parser'
import fileUtils from './core/utils/file-utils'
import folderUtils from './core/utils/folder-utils'

// import {getTemplate} from './cms/templates/abe-template'
import Create from './cms/Create'

import config from './core/config/config'

import abeProcess from './extend/abe-process'
import Hooks from './extend/abe-hooks'
import Plugins from './extend/abe-plugins'

import * as cmsData from './cms/data'
import * as cmsEditor from './cms/editor'
import * as cmsOperations from './cms/operations'
import * as cmsTemplate from './cms/templates'
import * as coreUtils from './core/utils'

export {
	cmsData
	,cmsOperations
	,cmsTemplate
	,coreUtils
	,cmsEditor
	,mkdirp

	,moment
	,fse
	,Handlebars
	,clc
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
	,Manager
	,Page
}

export {compileAbe as compileAbe}
