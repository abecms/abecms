import fse from 'fs-extra'
import extend from 'extend'
import {Promise} from 'es6-promise'

import {
  getAttr
  ,Util
  ,config
  ,fileUtils
  ,cli
  ,log
  ,FileParser
  ,escapeTextToRegex
  ,Hooks
  ,Plugins
} from '../../cli'

function addOrder(text) {
  var regAbe = /{{abe[\S\s].*?key=['|"]([\S\s].*?['|"| ]}})/g
  var matches = text.match(regAbe)
  var order = 0
  
  if(typeof matches !== 'undefined' && matches !== null){
    Array.prototype.forEach.call(matches, (match) => {
      if(typeof match !== 'undefined' && match !== null) {
        
        var keyAttr = getAttr(match, 'key')
        var orderAttr = getAttr(match, 'order')

        if(typeof orderAttr === 'undefined' || orderAttr === null || orderAttr === '') {
          var matchOrder = match.replace(/\}\}$/, ` order='${order}'}}`)
          text = text.replace(match, matchOrder)
        }
        order++
      }
    })
  }
  return text
}

function partials(text) {
  var importReg = /({{abe.*type=[\'|\"]import.*}})/g
  var match

  while (match = importReg.exec(text)) {
    var file = getAttr(match[0], 'file')
    var partial = ''
    file = fileUtils.concatPath(config.root, config.partials, file)
    if(fileUtils.isFile(file)) {
      partial = fse.readFileSync(file, 'utf8')
    }
    text = text.replace(escapeTextToRegex(match[0], 'g'), partial)
  }

  return text
}

function translate(text) {
  var importReg = /({{abe.*type=[\'|\"]translate.*}})/g
  var match


  var matches = text.match(importReg)
  var order = 0
  
  if(typeof matches !== 'undefined' && matches !== null) {
    Array.prototype.forEach.call(matches, (match) => {
    	var splitedMatches = match.split('{{abe ')

    	Array.prototype.forEach.call(splitedMatches, (splitedMatch) => {
    		var currentMatch = `{{abe ${splitedMatch}`
    		if(/({{abe.*type=[\'|\"]translate.*}})/.test(currentMatch)) {
  				var locale = getAttr(currentMatch, 'locale')
  				var source = getAttr(currentMatch, 'source')

  				if (locale.indexOf('{{') === -1) {
  					locale = `'${locale}'`
  				}else {
  					locale = locale.replace(/\{\{(.*?)\}\}/, '$1')
  				}

  				if (source.indexOf('{{') === -1) {
  					source = `'${source.replace(/'/g, "\\'")}'`
  				}else {
  					source = source.replace(/\{\{(.*?)\}\}/, '$1')
  				}

          // var replace = `{{{i18nAbe ${locale} ${source}}}}`
          var replace = currentMatch.replace('{{abe', '{{i18nAbe')
          replace = replace.replace(/locale=['|"].*?['|"]/, locale)
  				replace = replace.replace(/source=['|"].*?['|"]/, source)
          replace = replace.replace(/{{i18nAbe.*?}}/, `{{{i18nAbe ${locale} ${source}}}}`)

  				text = text.replace(escapeTextToRegex(currentMatch, 'g'), replace)
    		}
    	})
    })
  }

  return text
}

export function getTemplate (file) {
  var text = ''

  // HOOKS beforeGetTemplate
  file = Hooks.instance.trigger('beforeGetTemplate', file)

  file = file.replace(fileUtils.concatPath(config.root, config.templates.url), '')
  file = file.replace(config.root, '')
  if (file.indexOf('.') > -1) {
  	file = fileUtils.removeExtension(file)
  }
  file = fileUtils.concatPath(config.root, config.templates.url, file + '.' + config.files.templates.extension)
  if(fileUtils.isFile(file)) {
    text = fse.readFileSync(file, 'utf8')
	  text = partials(text)
	  text = translate(text)
	  text = addOrder(text)
  }else {
    text = `[ ERROR ] template ${config.templates.url} doesn't exist anymore`
  }

  // HOOKS afterGetTemplate
  text = Hooks.instance.trigger('afterGetTemplate', text)

  return text
}