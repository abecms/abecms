import Handlebars from 'handlebars'
import HandlebarsIntl from 'handlebars-intl'
import handlebarsHelperSlugify from 'handlebars-helper-slugify'

import hooks 		from '../helpers/abe-hooks'

/* Handlebar utilities */
import attrAbe 		from './utils/attrAbe'
import className 	from './utils/className'
import cleanTab 	from './utils/cleanTab'
import ifCond 		from './utils/ifCond'
import ifIn 			from './utils/ifIn'
import isTrue 		from './utils/isTrue'
import math 			from './utils/math'
import moduloIf 	from './utils/moduloIf'
import notEmpty 	from './utils/notEmpty'
import printJson 	from './utils/printJson'
import testObj 		from './utils/testObj'
import translate 	from './utils/translate'
import times 			from './utils/times'
import truncate 	from './utils/truncate'

/* Handlebar abe */
import abeEngine 						from './abe/abeEngine'
import abeImport 						from './abe/abeImport'
import compileAbe 					from './abe/compileAbe'
import folders 							from './abe/folders'
import listPage 						from './abe/listPage'
import printBlock 					from './abe/printBlock'
import printConfig 					from './abe/printConfig'
import printInput 					from './abe/printInput'
import recursiveFolder 			from './abe/recursiveFolder'
import recursivePrintConfig from './abe/recursivePrintConfig'
import sourceAttr 					from './abe/sourceAttr'
import sourceAutocomplete 	from './abe/sourceAutocomplete'
import sourceOption 				from './abe/sourceOption'

/* Register utilities */
Handlebars.registerHelper('attrAbe', 		attrAbe)
Handlebars.registerHelper('className', 	className)
Handlebars.registerHelper('cleanTab', 	cleanTab)
Handlebars.registerHelper('slugify', 		handlebarsHelperSlugify({Handlebars: Handlebars}).slugify)
Handlebars.registerHelper('ifCond', 		ifCond)
Handlebars.registerHelper('ifIn', 			ifIn)
Handlebars.registerHelper('isTrue', 		isTrue)
Handlebars.registerHelper('math', 			math)
Handlebars.registerHelper('moduloIf', 	moduloIf)
Handlebars.registerHelper('notEmpty', 	notEmpty)
Handlebars.registerHelper('printJson', 	printJson)
Handlebars.registerHelper('testObj', 		testObj)
Handlebars.registerHelper('i18nAbe', 		translate)
Handlebars.registerHelper('times', 			times)
Handlebars.registerHelper('truncate', 	truncate)

/* Register abe */
Handlebars.registerHelper('abeImport', 	abeImport)
Handlebars.registerHelper('abe', 				compileAbe)
Handlebars.registerHelper('folders', 		folders)
Handlebars.registerHelper('listPage', 	listPage)
Handlebars.registerHelper('printBlock', printBlock)
Handlebars.registerHelper('printConfig',printConfig)
Handlebars.registerHelper('printInput', printInput)

HandlebarsIntl.registerWith(Handlebars)

export {
	attrAbe
	,className
	,cleanTab
	,ifCond
	,ifIn
	,isTrue
	,truncate
	,math
	,moduloIf
	,notEmpty
	,printJson
	,testObj
	,translate
	,times
	,abeEngine
	,abeImport
	,compileAbe
	,folders
	,listPage
	,printBlock
	,printConfig
	,printInput
	,recursiveFolder
	,recursivePrintConfig
	,sourceAttr
	,sourceAutocomplete
	,sourceOption
}

