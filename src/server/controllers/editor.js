import {Promise} from 'bluebird'
import path from 'path'

import {
  cmsData,
  cmsEditor,
  abeEngine,
  cmsTemplates,
  abeExtend
} from '../../cli'

export function add(obj, json, text, util) {
  var value = obj.value

  if(obj.key.indexOf('[') > -1) {
    var key = obj.key.split('[')[0]
    var index = obj.key.match(/[^\[]+?(?=\])/)[0]
    var prop = obj.key.replace(/[^\.]+?\./, '')
    key = getDataIdWithNoSlash(key)

    try {
      obj.value = eval(`json[key][index]["${prop}"]`)
    } catch(e) {

      try {
        eval(`json[key][index]["${prop}"] = ` + JSON.stringify(value))
      }catch(e) {
        // no value found inside json OKEY
      }
    }
  }else {
    try {
      if(obj.key.indexOf('.') > -1) obj.value = eval(`json["${getDataIdWithNoSlash(obj.key).split('.').join('"]["')}"]`)
      else obj.value = eval(`json["${getDataIdWithNoSlash(obj.key)}"]`)
    } catch(e) {
      // no value found inside json OKEY
    }
  }

  obj.key = getDataIdWithNoSlash(obj.key)
  if (json != null && json.abe_meta != null) {
    obj.status = json.abe_meta.status
  }

  util.add(obj)

  return obj.value
}

function getDataIdWithNoSlash(key) {
  var trueKey = key
  if (trueKey.indexOf('/') > -1) {
    trueKey = trueKey.split('/')
    trueKey = trueKey[trueKey.length - 1]
  }
  return trueKey
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
      obj.value = json[getDataIdWithNoSlash(obj.key)]
      json[getDataIdWithNoSlash(obj.key)] = add(obj, json, text, util)
    }

  }else if(util.dontHaveKey(obj.key) && cmsData.regex.isSingleAbe(v, text)) {
    realKey = obj.key//.replace(/\./g, '-')
    try {
      obj.value = eval(`json["${getDataIdWithNoSlash(realKey)}"]`)
    }catch(e) {
      obj.value = null
    }
    // json[getDataIdWithNoSlash(obj.key)] = 
    add(obj, json, text, util)
  }
}

function matchAttrAbe(text, json, util, arrayBlock) {
  var patt = /abe [^{{}}]+?(?=\}})/g,
    match
  // While regexp match HandlebarsJS template item => keepgoing
  while (match = patt.exec(text)) {
    var matchText = match[0].replace(/value=([\'\"].*?[\'\"])/g, 'defaultvalue=$1')
    addToForm(matchText, text, json, util, arrayBlock, null, null)
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
  let patt = /{{(abe .*?["']) ?}}/g
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
  // removing each blocks potentially containing abe data type
  let pattEach = /(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g
  text = text.replace(pattEach, '')

  var listReg = /({{abe.*type=[\'|\"]data.*}})/g
  var match

  while (match = listReg.exec(text)) {
    var obj = cmsData.attributes.getAll(match[0], json)

    if(obj.editable) {
      obj.value = json[getDataIdWithNoSlash(obj.key)]
      add(obj, json, text, util)
    }else {
      json[getDataIdWithNoSlash(obj.key)] = obj.source
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

export function orderByGroup(form) {
  var noGroup = []
  var groups = {}
  var groupIndex = {}
  var index = 0

  Array.prototype.forEach.call(form.item, (item) => {
    if(item.group != null) {
      if(typeof groups[item.group] === 'undefined' || groups[item.group] === null){
        groupIndex[item.group] = index
        groups[item.group] = []
      }
      item.order = -1
      groups[item.group].push(item)
    }
    else noGroup.push(item)
    index++
  })

  for(var prop in groups){
    var group = groups[prop]
    group[0].firstgroup = 1
    group[group.length - 1].lastgroup = 1
    noGroup = noGroup.splice(0, groupIndex[group[0].group]).concat(group).concat(noGroup)
  }

  return {item: noGroup}
}

function orderBlock(util) {
    
  var formBlock = {}

  for(var tab in util.form) {

    var formBlockTab = {}
    var utilFormTab = orderByGroup(util.form[tab])
    for (var i = 0; i < utilFormTab.item.length; i++) {
      var blockName = (utilFormTab.item[i].block === '') ? 'default_' + i : utilFormTab.item[i].block
      if(utilFormTab.item[i].key.indexOf('[') > -1){
        blockName = utilFormTab.item[i].key.split('[')[0]
      }
      if(typeof formBlockTab[blockName] === 'undefined' || formBlockTab[blockName] === null) {
        formBlockTab[blockName] = []
      }
      formBlockTab[blockName].push(utilFormTab.item[i])
    }
    if(typeof blockName !== 'undefined' && blockName !== null) {
      formBlockTab[blockName].sort(orderByTabindex)
    }
    if(typeof formBlock[tab] === 'undefined' || formBlock[tab] === null) {
      formBlock[tab] = {}
    }
    var formBlockOrdered = {}
    var arKeys = Object.keys(formBlockTab).sort((a,b) => {
      if(parseFloat(formBlockTab[a][0].order) < parseFloat(formBlockTab[b][0].order)) {
        return -1
      }else if(parseFloat(formBlockTab[a][0].order) > parseFloat(formBlockTab[b][0].order)) {
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
    if(parseFloat(formBlock[a][Object.keys(formBlock[a])[0]][0].order) < parseFloat(formBlock[b][Object.keys(formBlock[b])[0]][0].order)) {
      return -1
    }else if(parseFloat(formBlock[a][Object.keys(formBlock[a])[0]][0].order) > parseFloat(formBlock[b][Object.keys(formBlock[b])[0]][0].order)) {
      return 1
    }
    return 0
  })

  Array.prototype.forEach.call(arKeysTabs, (arKeysTab) => {
    if(arKeysTab !== 'slug') formTabsOrdered[arKeysTab] = formBlock[arKeysTab]
  })

  formTabsOrdered['slug'] = formBlock['slug']

  return formTabsOrdered
}

export function editor(text, json, documentLink, precontrib = false) {
  let p = new Promise((resolve) => {
    var util = new cmsEditor.form()
    var arrayBlock = []
    cmsData.source.getDataList(path.dirname(documentLink), text, json)
      .then(() => {
        addSource(text, json, util)

        text = cmsData.source.removeNonEachDataList(text)

        if (!precontrib) {
          text = cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist(text)
          text = cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist(text)
        }

        matchAttrAbe(text, json, util, arrayBlock)
        arrayBlock = []
        each(text, json, util, arrayBlock)

        text = cmsData.source.removeDataList(text)
        if(typeof json.abe_meta !== 'undefined' && json.abe_meta !== null) {
          var links = json.abe_meta.link.split('/')
          var link = links.pop()
          json.abe_meta.cleanName = link.replace(/\..+$/, '')
          json.abe_meta.cleanFilename = links.join('/').replace(/\..+$/, '')
        }

        if (!precontrib) {
          // HOOKS beforeEditorFormBlocks
          json = abeExtend.hooks.instance.trigger('beforeEditorFormBlocks', json, text)
        }

        var blocks = orderBlock(util)

        if (!precontrib) {
          // HOOKS afterEditorFormBlocks
          blocks = abeExtend.hooks.instance.trigger('afterEditorFormBlocks', blocks, json, text)
        }

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