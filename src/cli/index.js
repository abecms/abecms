import Handlebars from 'handlebars'
import moment from 'moment'
import fse from 'fs-extra'
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
	ifCond
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

// import {getTemplate} from './cms/templates/abe-template'
import Create from './cms/Create'

import config from './core/config/config'

import * as cmsData from './cms/data'
import * as cmsEditor from './cms/editor'
import * as cmsOperations from './cms/operations'
import * as cmsTemplates from './cms/templates'
import * as cmsReference from './cms/reference'
import * as cmsStructure from './cms/structure'
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
	cmsMedia,
	coreUtils,
	cmsEditor,
	abeExtend,
	mkdirp,
	moment,
	fse,
	Handlebars,
	clc,
	printInput,
	abeImport,
	math,
	Create,
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
	Manager,
	Page,
	User
}

export {compileAbe as compileAbe}
