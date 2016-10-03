import Handlebars from 'handlebars'
import moment from 'moment'
import fse from 'fs-extra'
import clc from 'cli-color'

import fileAttr from './cms/data/file-attr'
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
import Page from './models/Page'

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
import Sql from './cms/data/abe-sql'

import abeCreate from './cms/operations/abe-create'
import abeDuplicate from './cms/operations/abe-duplicate'
import {save, checkRequired, saveJson} from './cms/operations/save'

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
