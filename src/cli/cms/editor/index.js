import Handlebars from 'handlebars'
import HandlebarsIntl from 'handlebars-intl'
import handlebarsHelperSlugify from 'handlebars-helper-slugify'

import hooks 		from '../../extend/abe-hooks'

/* Handlebar abe */
import abeEngine 						from './handlebars/abeEngine'
import abeImport 						from './handlebars/abeImport'
import compileAbe 					from './handlebars/compileAbe'
import folders 							from './handlebars/folders'
import listPage 						from './handlebars/listPage'
import printBlock 					from './handlebars/printBlock'
import printConfig 					from './handlebars/printConfig'
import printInput 					from './handlebars/printInput'
import recursiveFolder 			from './handlebars/recursiveFolder'
import recursivePrintConfig from './handlebars/recursivePrintConfig'
import sourceAttr 					from './handlebars/sourceAttr'
import sourceAutocomplete 	from './handlebars/sourceAutocomplete'
import sourceOption 				from './handlebars/sourceOption'

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
	abeEngine,
	abeImport,
	compileAbe,
	folders,
	listPage,
	printBlock,
	printConfig,
	printInput,
	recursiveFolder,
	recursivePrintConfig,
	sourceAttr,
	sourceAutocomplete,
	sourceOption
}

