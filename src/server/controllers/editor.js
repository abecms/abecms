import {Promise} from 'es6-promise'
import path from 'path'

import {
  cmsData,
  cmsEditor,
  coreUtils,
  abeEngine,
  cmsTemplates,
  Hooks
} from '../../cli'

function add(obj, json, text, util) {
  var value = obj.value
  
  if(obj.key.indexOf('[') > -1) {
    var key = obj.key.split('[')[0]
    var index = obj.key.match(/[^\[]+?(?=\])/)[0]
    var prop = obj.key.replace(/[^\.]+?\./, '')

    if(typeof json[key] !== 'undefined' && json[key] !== null &&
       typeof json[key][index] !== 'undefined' && json[key][index] !== null &&
       typeof json[key][index][prop] !== 'undefined' && json[key][index][prop] !== null) {
      obj.value = json[key][index][prop]
    }else if(typeof value !== 'undefined' && value !== null && value !== '') {
      if(typeof json[key] === 'undefined' || json[key] === null){
        json[key] = []
      }
      if(typeof json[key][index] === 'undefined' || json[key][index] === null){
        json[key][index] = {}
      }
      json[key][index][prop] = value
    }
  }

  util.add(obj)

  return value
}

function addToForm(match, text, json, util, arrayBlock, keyArray = null, i = 0) {
  var v = `{{${match}}}`,
    obj = cmsData.attributes.getAll(v, json)

  var realKey
  if(typeof keyArray !== 'undefined' && keyArray !== null) {
    realKey = obj.key.replace(/[^\.]+?\./, '')

    if(obj.key.indexOf(keyArray + '.') >= 0 && realKey.length > 0){
      obj.keyArray = keyArray
      obj.realKey = realKey
      obj.key = keyArray + '[' + i + '].' + realKey
      obj.desc = obj.desc + ' ' + i,
      insertAbeEach(obj, text, json, util, arrayBlock)

    }else if(util.dontHaveKey(obj.key)) {
      obj.value = json[obj.key]
      json[obj.key] = add(obj, json, text, util)
    }

  }else if(util.dontHaveKey(obj.key) && cmsData.regex.isSingleAbe(v, text)) {
    realKey = obj.key.replace(/\./g, '-')
    obj.value = json[realKey]
    json[obj.key] = add(obj, json, text, util)
  }
}

function matchAttrAbe(text, json, util, arrayBlock) {
  var patt = /abe [^{{}}]+?(?=\}})/g,
    match
  // While regexp match HandlebarsJS template item => keepgoing
  while (match = patt.exec(text)) {
    addToForm(match[0], text, json, util, arrayBlock, null, null)
  }
}

function insertAbeEach (obj, text, json, util, arrayBlock) {
  if(typeof arrayBlock[obj.keyArray][obj.realKey] === 'undefined' || arrayBlock[obj.keyArray][obj.realKey] === null) {
    arrayBlock[obj.keyArray][obj.realKey] = []
  }
  var exist = false
  Array.prototype.forEach.call(arrayBlock[obj.keyArray][obj.realKey], (block) => {
    if(block.key === obj.key) {
      exist = true
    }
  })
  if(!exist) {
    arrayBlock[obj.keyArray][obj.realKey].push(obj)
  }
}

function each(text, json, util, arrayBlock) {
  let pattEach = /(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g
  let patt = /abe [^{{}}]+?(?=\}})/g
  var textEach, match

  while (textEach = pattEach.exec(text)) {
    var i
    var keyArray = textEach[0].match(/#each (\n|.)*?\}/)
    keyArray = keyArray[0].slice(6, keyArray[0].length - 1)

    if(keyArray.split(' ').length > 1){
      keyArray = keyArray.split(' ')[0]
    }
    arrayBlock[keyArray] = []
    // ce while boucle sur les block de contenu {{abe}}
    while (match = patt.exec(textEach[0])) {
      var v = match[0]

      if(v.indexOf('abe') > -1){
        if(json[keyArray]){
          for (i = 0; i < json[keyArray].length; i++) {
            addToForm(v, text, json, util, arrayBlock, keyArray, i)
          }
        }else{
          addToForm(v, text, json, util, arrayBlock, keyArray, 0)
        }
      }
    }

    // ici on boucle a nouveau sur les champs pour les placer a la suite dans le formulaire
    var attrArray = [],
      length = 0
    for(var index in arrayBlock[keyArray]) {
      attrArray.push(index)
      length = arrayBlock[keyArray][index].length
    }

    for (i = 0; i < length; i++) {
      for (var j = 0; j < attrArray.length; j++) {
        add(arrayBlock[keyArray][attrArray[j]][i], json, text, util)
      }
    }
  }
}

function addSource(text, json, util) {
  var listReg = /({{abe.*type=[\'|\"]data.*}})/g
  var match

  while (match = listReg.exec(text)) {
    var obj = cmsData.attributes.getAll(match[0], json)

    if(obj.editable) {
      obj.value = json[obj.key]
      add(obj, json, text, util)
    }else {
      json[obj.key] = obj.source
    }
  }
}

function orderByTabindex(a, b) {
  if(a.order < b.order) {
    return -1
  }else if(a.order > b.order) {
    return 1
  }

  return 0
}

function orderBlock(util) {
    
  var formBlock = {}

  for(var tab in util.form) {

    var formBlockTab = {}
    for (var i = 0; i < util.form[tab].item.length; i++) {
      var blockName = (util.form[tab].item[i].block === '') ? 'default_' + i : util.form[tab].item[i].block
      if(util.form[tab].item[i].key.indexOf('[') > -1){
        blockName = util.form[tab].item[i].key.split('[')[0]
      }
      if(typeof formBlockTab[blockName] === 'undefined' || formBlockTab[blockName] === null) {
        formBlockTab[blockName] = []
      }
      formBlockTab[blockName].push(util.form[tab].item[i])
    }
    if(typeof blockName !== 'undefined' && blockName !== null) {
      formBlockTab[blockName].sort(orderByTabindex)
    }
    if(typeof formBlock[tab] === 'undefined' || formBlock[tab] === null) {
      formBlock[tab] = {}
    }

    var formBlockOrdered = {}
    var arKeys = Object.keys(formBlockTab).sort((a,b) => {
      if(formBlockTab[a][0].order < formBlockTab[b][0].order) {
        return -1
      }else if(formBlockTab[a][0].order > formBlockTab[b][0].order) {
        return 1
      }
      return 0
    })

    Array.prototype.forEach.call(arKeys, (arKey) => {
      formBlockOrdered[arKey] = formBlockTab[arKey]
    })
    formBlock[tab] = formBlockOrdered
  }

  var formTabsOrdered = {}
  var arKeysTabs = Object.keys(formBlock).sort((a,b) => {
    if(formBlock[a][Object.keys(formBlock[a])[0]][0].order < formBlock[b][Object.keys(formBlock[b])[0]][0].order) {
      return -1
    }else if(formBlock[a][Object.keys(formBlock[a])[0]][0].order > formBlock[b][Object.keys(formBlock[b])[0]][0].order) {
      return 1
    }
    return 0
  })

  Array.prototype.forEach.call(arKeysTabs, (arKeysTab) => {
    formTabsOrdered[arKeysTab] = formBlock[arKeysTab]
  })

  return formTabsOrdered
}

export function editor(fileName, jsonPath, documentLink) {
  let p = new Promise((resolve) => {
    var util = new cmsEditor.form()
    var arrayBlock = []
    var text
    var json

    json = {}
    if(coreUtils.file.exist(jsonPath)) {
      json = cmsData.file.get(jsonPath, 'utf8')
    }
    
    text = cmsTemplates.template.getTemplate(fileName)

    cmsData.source.getDataList(path.dirname(documentLink), text, json, true)
      .then(() => {
        addSource(text, json, util)

        text = cmsData.source.removeDataList(text)

        matchAttrAbe(text, json, util, arrayBlock)
        arrayBlock = []
        each(text, json, util, arrayBlock)

        if(typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
          var tpl = json.abe_meta.template.split('/')
          tpl = tpl.pop()
          json.abe_meta.cleanTemplate = tpl.replace(/\..+$/, '')
        }

        if(typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
          var links = json.abe_meta.link.split('/')
          var link = links.pop()
          json.abe_meta.cleanName = link.replace(/\..+$/, '')
          json.abe_meta.cleanFilename = links.join('/').replace(/\..+$/, '')
        }

        // HOOKS beforeEditorFormBlocks
        json = Hooks.instance.trigger('beforeEditorFormBlocks', json)

        var blocks = orderBlock(util)

        // HOOKS afterEditorFormBlocks
        blocks = Hooks.instance.trigger('afterEditorFormBlocks', blocks, json)

        abeEngine.instance.content = json

        resolve({
          text: text,
          form: blocks,
          json: json
        })
      }).catch(function(e) {
        console.error(e)
      })
  })

  return p
}