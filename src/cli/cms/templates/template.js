import fse from 'fs-extra'
import {Promise} from 'bluebird'
import path from 'path'
import {
  config,
  coreUtils,
  cmsData,
  abeExtend
} from '../../'

export function getTemplatesAndPartials(templatesPath) {
  var p = new Promise((resolve) => {
    const extension = '.' + config.files.templates.extension
    return coreUtils.file.getFilesAsync(templatesPath, true, extension)
      .then(function(files){
        return resolve(files)
      })
  })

  return p
}

export function addOrder(text) {
  var regAbe = /{{abe[\S\s].*?key=['|"]([\S\s].*?['|"| ]}})/g
  var matches = text.match(regAbe)
  var order = 0
  
  if(typeof matches !== 'undefined' && matches !== null){
    Array.prototype.forEach.call(matches, (match) => {
      if(typeof match !== 'undefined' && match !== null) {
        
        var orderAttr = cmsData.regex.getAttr(match, 'order')

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

export function getAbeImport(text) {
  var partials = []
  let listReg = /({{abe.*?type=[\'|\"]import.*?}})/g
  var match
  while (match = listReg.exec(text)) {
    partials.push(match[0])
  }

  return partials
}

export function includePartials(text) {
  var abeImports = getAbeImport(text)

  Array.prototype.forEach.call(abeImports, (abeImport) => {
    var obj = cmsData.attributes.getAll(abeImport, {})

    var file = obj.file
    var partial = ''
    file = path.join(config.root, config.partials, file)
    if(coreUtils.file.exist(file)) {
      partial = includePartials(fse.readFileSync(file, 'utf8'))
    }
    text = text.replace(cmsData.regex.escapeTextToRegex(abeImport, 'g'), partial)
  })

  return text
}

function translate(text) {
  var importReg = /({{abe.*type=[\'|\"]translate.*}})/g

  var matches = text.match(importReg)
  
  if(typeof matches !== 'undefined' && matches !== null) {
    Array.prototype.forEach.call(matches, (match) => {
      var splitedMatches = match.split('{{abe ')

      Array.prototype.forEach.call(splitedMatches, (splitedMatch) => {
        var currentMatch = `{{abe ${splitedMatch}`
        if(/({{abe.*type=[\'|\"]translate.*}})/.test(currentMatch)) {
          var locale = cmsData.regex.getAttr(currentMatch, 'locale')
          var source = cmsData.regex.getAttr(currentMatch, 'source')

          if (locale.indexOf('{{') === -1) {
            locale = `'${locale}'`
          }else {
            locale = locale.replace(/\{\{(.*?)\}\}/, '$1')
          }

          if (source.indexOf('{{') === -1) {
            source = `'${source.replace(/'/g, '\\\'')}'`
          }else {
            source = source.replace(/\{\{(.*?)\}\}/, '$1')
          }

          // var replace = `{{{i18nAbe ${locale} ${source}}}}`
          var replace = currentMatch.replace('{{abe', '{{i18nAbe')
          replace = replace.replace(/locale=['|"].*?['|"]/, locale)
          replace = replace.replace(/source=['|"].*?['|"]/, source)
          replace = replace.replace(/{{i18nAbe.*?}}/, `{{{i18nAbe ${locale} ${source}}}}`)

          text = text.replace(cmsData.regex.escapeTextToRegex(currentMatch, 'g'), replace)
        }
      })
    })
  }

  return text
}

export function getTemplate (file) {
  var text = ''

  // HOOKS beforeGetTemplate
  file = abeExtend.hooks.instance.trigger('beforeGetTemplate', file)

  file = file.replace(path.join(config.root, config.templates.url), '')
  file = file.replace(config.root, '')
  if (file.indexOf('.') > -1) {
    file = file.replace(/\..+$/, '')
  }
  file = path.join(config.root, config.templates.url, file + '.' + config.files.templates.extension)
  if(coreUtils.file.exist(file)) {
    text = fse.readFileSync(file, 'utf8')
    text = includePartials(text)
    text = translate(text)
    text = addOrder(text)
  }else {
    text = `[ ERROR ] template ${file + '.' + config.files.templates.extension} doesn't exist anymore`
  }

  // HOOKS afterGetTemplate
  text = abeExtend.hooks.instance.trigger('afterGetTemplate', text)

  return text
}

export function getVariablesInWhere(where) {
  var ar = []

  if(where.left.column.indexOf('{{') > -1) {
    ar.push(where.left.column.replace(/\{\{(.*?)\}\}/, '$1'))
  }
  else{
    ar.push(where.left.column)
  }

  if (where.right.value) {
    if (typeof where.right.value === 'string') {
      if(where.right.value && where.right.value.indexOf('{{') > -1) {
        ar.push(where.right.value.replace(/\{\{(.*?)\}\}/, '$1'))
      }
    }else {
      where.right.value.forEach(function (value) {
        if(value.column.indexOf('{{') > -1) {
          ar.push(value.column.replace(/\{\{(.*?)\}\}/, '$1'))
        }
      })
    }
  }

  if(where.right.column && where.right.column.indexOf('{{') > -1) {
    ar.push(where.right.column.replace(/\{\{(.*?)\}\}/, '$1'))
  }

  return ar
}

/**
 * Get columns and where.left ids of a select statement
 *
 * select title, image from ../ where template=""
 *
 * return [title, image, template]
 * 
 * @param  {Array} templatesList ["article.html", "other.html"]
 * @return {Promise}
 */
export function recurseWhereVariables (where) {
  var ar = []
  var arLeft
  var arRight
  switch(where.operator) {
  case 'AND':
    arLeft = recurseWhereVariables(where.left)
    arRight = recurseWhereVariables(where.right)
    return arLeft.concat(arRight)
    break
  case 'OR':
    arLeft = recurseWhereVariables(where.left)
    arRight = recurseWhereVariables(where.right)
    return arLeft.concat(arRight)
    break
  default:
    ar = getVariablesInWhere(where)
    break
  }

  return ar
}

export function execRequestColumns(tpl) {
  var ar = []
  var matches = cmsData.regex.getTagAbeTypeRequest(tpl)
  Array.prototype.forEach.call(matches, (match) => {
    var obj = cmsData.attributes.getAll(match[0], {})
    var type = cmsData.sql.getSourceType(obj.sourceString)
    switch (type) {
    case 'request':
      var request = cmsData.sql.handleSqlRequest(obj.sourceString, {})
      if(typeof request.columns !== 'undefined' && request.columns !== null) {
        Array.prototype.forEach.call(request.columns, (column) => {
          ar.push(column)
        })
      }
      if(typeof request.where !== 'undefined' && request.where !== null) {
        ar = ar.concat(recurseWhereVariables(request.where))
      }
    }
  })

  return ar
}

export function findRequestColumns(templatesList) {
  var whereKeys = []
  var p = new Promise((resolve) => {
    Array.prototype.forEach.call(templatesList, (file) => {
      var template = fse.readFileSync(file, 'utf8')
      whereKeys = whereKeys.concat(execRequestColumns(template))
    })
    whereKeys = whereKeys.filter(function (item, pos) {return whereKeys.indexOf(item) == pos})
    resolve(whereKeys)
  })

  return p
}

export function getSelectTemplateKeys(templatesPath) {
  var p = new Promise((resolve, reject) => {
    return getTemplatesAndPartials(templatesPath)
      .then((templatesList) => {
        return findRequestColumns(templatesList)
          .then((whereKeys) => {
            resolve(whereKeys)
          },
          (e) => {
            console.log('findRequestColumns reject')
            reject(e)
          })
          .catch((e) => {
            console.error('getSelectTemplateKeys', e)
            reject()
          })
      },
      () => {
        console.log('getTemplateAndPartials reject')
        reject()
      })
      .catch((e) => {
        console.error('getSelectTemplateKeys', e)
        reject()
      })

  })

  return p
}

export function getStructureAndTemplates() {
  const pathStructure = path.join(config.root, config.structure.url)
  const pathTemplates = path.join(config.root, config.templates.url)
  const extension = '.' + config.files.templates.extension
  let result = {'structure': [], 'templates': []}

  result.structure = coreUtils.file.getFoldersSync(pathStructure, true)
  let templatePaths = coreUtils.file.getFilesSync(pathTemplates, true, extension)
  Array.prototype.forEach.call(templatePaths, (templatePath) => {
    let additionalPath = path.dirname(templatePath).replace(pathTemplates,'')
    if(additionalPath !== '') additionalPath = additionalPath.substring(1)
    let name = path.join(additionalPath,path.basename(templatePath,extension))
    let template = {'path':templatePath, 'cleanPath':templatePath, 'name':name}
    result.templates.push(template)
  })

  return result
}