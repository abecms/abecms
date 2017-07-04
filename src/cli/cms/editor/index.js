import Handlebars from 'handlebars'
import HandlebarsIntl from 'handlebars-intl'
import form from './form'

/* Handlebar abe */
import abeEngine 						from './handlebars/abeEngine'
import abeImport 						from './handlebars/abeImport'
import compileAbe 					from './handlebars/compileAbe'
import folders 							from './handlebars/folders'
import listPage 						from './handlebars/listPage'
import printBlock 					from './handlebars/printBlock'
import printConfig 					from './handlebars/printConfig'
import recursiveFolder 			from './handlebars/recursiveFolder'
import recursivePrintConfig from './handlebars/recursivePrintConfig'
import sourceAttr 					from './handlebars/sourceAttr'
import sourceAutocomplete 	from './handlebars/sourceAutocomplete'
import sourceOption 				from './handlebars/sourceOption'
import raw 									from './handlebars/raw'
import {
	printInput,
	getAttributes,
	getLabel,
	hint,
	createInputSource,
	createInputRich,
	createInputFile,
	createInputTextarea,
	createInputLink,
	createInputImage,
	createInputText
} from './handlebars/printInput'

Handlebars.registerHelper('abeImport', 	abeImport)
Handlebars.registerHelper('abe', 				compileAbe)
Handlebars.registerHelper('folders', 		folders)
Handlebars.registerHelper('listPage', 	listPage)
Handlebars.registerHelper('printBlock', printBlock)
Handlebars.registerHelper('printConfig',printConfig)
Handlebars.registerHelper('printInput', printInput)
Handlebars.registerHelper('raw', raw)

HandlebarsIntl.registerWith(Handlebars)

export {
	form,
	abeEngine,
	abeImport,
	compileAbe,
	folders,
	listPage,
	printBlock,
	printConfig,
	recursiveFolder,
	recursivePrintConfig,
	sourceAttr,
	sourceAutocomplete,
	sourceOption,
	raw,
	printInput,
	getAttributes,
	getLabel,
	hint,
	createInputSource,
	createInputRich,
	createInputFile,
	createInputTextarea,
	createInputLink,
	createInputImage,
	createInputText
}

