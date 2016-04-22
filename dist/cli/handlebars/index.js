'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.sourceOption = exports.sourceAutocomplete = exports.sourceAttr = exports.recursivePrintConfig = exports.recursiveFolder = exports.printInput = exports.printConfig = exports.printBlock = exports.listPage = exports.folders = exports.compileAbe = exports.abeImport = exports.abeEngine = exports.translate = exports.testObj = exports.printJson = exports.notEmpty = exports.moduloIf = exports.math = exports.ifIn = exports.ifCond = exports.cleanTab = exports.className = exports.attrAbe = undefined;

var _handlebars = require('handlebars');

var _handlebars2 = _interopRequireDefault(_handlebars);

var _handlebarsIntl = require('handlebars-intl');

var _handlebarsIntl2 = _interopRequireDefault(_handlebarsIntl);

var _handlebarsHelperSlugify = require('handlebars-helper-slugify');

var _handlebarsHelperSlugify2 = _interopRequireDefault(_handlebarsHelperSlugify);

var _abeHooks = require('../helpers/abe-hooks');

var _abeHooks2 = _interopRequireDefault(_abeHooks);

var _attrAbe = require('./utils/attrAbe');

var _attrAbe2 = _interopRequireDefault(_attrAbe);

var _className = require('./utils/className');

var _className2 = _interopRequireDefault(_className);

var _cleanTab = require('./utils/cleanTab');

var _cleanTab2 = _interopRequireDefault(_cleanTab);

var _ifCond = require('./utils/ifCond');

var _ifCond2 = _interopRequireDefault(_ifCond);

var _ifIn = require('./utils/ifIn');

var _ifIn2 = _interopRequireDefault(_ifIn);

var _math = require('./utils/math');

var _math2 = _interopRequireDefault(_math);

var _moduloIf = require('./utils/moduloIf');

var _moduloIf2 = _interopRequireDefault(_moduloIf);

var _notEmpty = require('./utils/notEmpty');

var _notEmpty2 = _interopRequireDefault(_notEmpty);

var _printJson = require('./utils/printJson');

var _printJson2 = _interopRequireDefault(_printJson);

var _testObj = require('./utils/testObj');

var _testObj2 = _interopRequireDefault(_testObj);

var _translate = require('./utils/translate');

var _translate2 = _interopRequireDefault(_translate);

var _abeEngine = require('./abe/abeEngine');

var _abeEngine2 = _interopRequireDefault(_abeEngine);

var _abeImport = require('./abe/abeImport');

var _abeImport2 = _interopRequireDefault(_abeImport);

var _compileAbe = require('./abe/compileAbe');

var _compileAbe2 = _interopRequireDefault(_compileAbe);

var _folders = require('./abe/folders');

var _folders2 = _interopRequireDefault(_folders);

var _listPage = require('./abe/listPage');

var _listPage2 = _interopRequireDefault(_listPage);

var _printBlock = require('./abe/printBlock');

var _printBlock2 = _interopRequireDefault(_printBlock);

var _printConfig = require('./abe/printConfig');

var _printConfig2 = _interopRequireDefault(_printConfig);

var _printInput = require('./abe/printInput');

var _printInput2 = _interopRequireDefault(_printInput);

var _recursiveFolder = require('./abe/recursiveFolder');

var _recursiveFolder2 = _interopRequireDefault(_recursiveFolder);

var _recursivePrintConfig = require('./abe/recursivePrintConfig');

var _recursivePrintConfig2 = _interopRequireDefault(_recursivePrintConfig);

var _sourceAttr = require('./abe/sourceAttr');

var _sourceAttr2 = _interopRequireDefault(_sourceAttr);

var _sourceAutocomplete = require('./abe/sourceAutocomplete');

var _sourceAutocomplete2 = _interopRequireDefault(_sourceAutocomplete);

var _sourceOption = require('./abe/sourceOption');

var _sourceOption2 = _interopRequireDefault(_sourceOption);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Register utilities */


/* Handlebar utilities */
_handlebars2.default.registerHelper('attrAbe', _attrAbe2.default);

/* Handlebar abe */

_handlebars2.default.registerHelper('className', _className2.default);
_handlebars2.default.registerHelper('cleanTab', _cleanTab2.default);
_handlebars2.default.registerHelper('slugify', (0, _handlebarsHelperSlugify2.default)({ Handlebars: _handlebars2.default }).slugify);
_handlebars2.default.registerHelper('ifCond', _ifCond2.default);
_handlebars2.default.registerHelper('ifIn', _ifIn2.default);
_handlebars2.default.registerHelper('math', _math2.default);
_handlebars2.default.registerHelper('moduloIf', _moduloIf2.default);
_handlebars2.default.registerHelper('notEmpty', _notEmpty2.default);
_handlebars2.default.registerHelper('printJson', _printJson2.default);
_handlebars2.default.registerHelper('testObj', _testObj2.default);
_handlebars2.default.registerHelper('i18nAbe', _translate2.default);

/* Register abe */
_handlebars2.default.registerHelper('abeImport', _abeImport2.default);
_handlebars2.default.registerHelper('abe', _compileAbe2.default);
_handlebars2.default.registerHelper('folders', _folders2.default);
_handlebars2.default.registerHelper('listPage', _listPage2.default);
_handlebars2.default.registerHelper('printBlock', _printBlock2.default);
_handlebars2.default.registerHelper('printConfig', _printConfig2.default);
_handlebars2.default.registerHelper('printInput', _printInput2.default);

_handlebarsIntl2.default.registerWith(_handlebars2.default);

exports.attrAbe = _attrAbe2.default;
exports.className = _className2.default;
exports.cleanTab = _cleanTab2.default;
exports.ifCond = _ifCond2.default;
exports.ifIn = _ifIn2.default;
exports.math = _math2.default;
exports.moduloIf = _moduloIf2.default;
exports.notEmpty = _notEmpty2.default;
exports.printJson = _printJson2.default;
exports.testObj = _testObj2.default;
exports.translate = _translate2.default;
exports.abeEngine = _abeEngine2.default;
exports.abeImport = _abeImport2.default;
exports.compileAbe = _compileAbe2.default;
exports.folders = _folders2.default;
exports.listPage = _listPage2.default;
exports.printBlock = _printBlock2.default;
exports.printConfig = _printConfig2.default;
exports.printInput = _printInput2.default;
exports.recursiveFolder = _recursiveFolder2.default;
exports.recursivePrintConfig = _recursivePrintConfig2.default;
exports.sourceAttr = _sourceAttr2.default;
exports.sourceAutocomplete = _sourceAutocomplete2.default;
exports.sourceOption = _sourceOption2.default;