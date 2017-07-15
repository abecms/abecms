import {Promise} from 'bluebird'
import path from 'path'

import {
  coreUtils,
  cmsData,
  cmsEditor,
  abeEngine,
  cmsTemplates,
  abeExtend
} from '../../cli'

export function add(obj, json, util) {
  var value = obj.value

  if(obj.key.indexOf('[') > -1) {
    var key = obj.key.split('[')[0]
    var index = obj.key.match(/[^\[]+?(?=\])/)[0]
    var prop = obj.key.replace(/[^\.]+?\./, '')

    try {
      obj.value = eval(`json[key][index]["${prop}"]`)
    } catch(e) {

      try {
        eval(`json[key][index]["${prop}"] = ` + JSON.stringify(value))
      } catch(e) {
        // no value found inside json KEY
      }
    }
  } else {
    try {
      if(obj.key.indexOf('.') > -1) obj.value = eval(`json["${obj.key.split('.').join('"]["')}"]`)
      else obj.value = eval(`json["${obj.key}"]`)
    } catch(e) {
      // no value found inside json KEY
    }
  }

  if (json != null && json.abe_meta != null) {
    obj.status = json.abe_meta.status
  }

  util.add(obj)

  return obj.value
}

function addAbeCollectionToForm(match, text, json, util, arrayBlock, keyArray = null, i = 0) {

  var obj = cmsData.attributes.getAll(`{{${match}}}`, json)

  if(typeof keyArray !== 'undefined' && keyArray !== null) {
    // removes the first part of the key. ie. 'main.article' becomes 'article'
    var realKey = obj.key.replace(/[^\.]+?\./, '')

    if(obj.key.indexOf(keyArray + '.') >= 0 && realKey.length > 0){
      obj.keyArray = keyArray
      obj.realKey = realKey
      obj.key = keyArray + '[' + i + '].' + realKey
      obj.desc = obj.desc + ' ' + i,
      insertAbeEach(obj, text, json, util, arrayBlock)
    } else if(util.dontHaveKey(obj.key)) {
      obj.value = json[obj.key]
      json[obj.key] = add(obj, json, util)
    }
  }
}

function addAbeTagToForm(match, text, json, util, arrayBlock) {
  
  var obj = cmsData.attributes.getAll(`{{${match}}}`, json)

  if(util.dontHaveKey(obj.key) && cmsData.regex.isSingleAbe(`{{${match}}}`, text)) {
    var realKey = obj.key
    try {
      obj.value = eval(`json["${realKey}"]`)
    } catch(e) {
      obj.value = null
    }

    add(obj, json, util)
  }
}

/**
 * parse every abe tags, 
 * create the forcedvalue attribute if it find a value in 'value' attribute
 * then add this tag to form
 *
 * @param  {[type]} text       [description]
 * @param  {[type]} json       [description]
 * @param  {[type]} util       [description]
 * @param  {[type]} arrayBlock [description]
 * @return {[type]}            [description]
 */
function matchAttrAbe(text, json, util, arrayBlock) {
  var patt = /abe [^{{}}]+?(?=\}})/g,
    match
  // While regexp match HandlebarsJS template item => keepgoing
  while (match = patt.exec(text)) {
    var matchText = match[0].replace(/value=([\'\"].*?[\'\"])/g, 'forcedvalue=$1')
    addAbeTagToForm(matchText, text, json, util, arrayBlock)
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
            addAbeCollectionToForm(v, text, json, util, arrayBlock, keyArray, i)
          }
        }else{
          addAbeCollectionToForm(v, text, json, util, arrayBlock, keyArray, 0)
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
        add(arrayBlock[keyArray][attrArray[j]][i], json, util)
      }
    }
  }
}

/**
 * Removing all type='data' included in {{#each}} statements
 * Then if editable, prepare value of the field in the editor with values from source
 * if not editable, put the json value with values from source
 *
 * @param {[type]} text [description]
 * @param {[type]} json [description]
 * @param {[type]} util [description]
 */
function addSource(text, json, util) {
  // removing each blocks potentially containing abe data type
  let pattEach = /(\{\{#each (\r|\t|\n|.)*?\/each\}\})/g
  text = text.replace(pattEach, '')

  var listReg = /({{abe.*type=[\'|\"]data.*}})/g
  var match

  while (match = listReg.exec(text)) {
    var obj = cmsData.attributes.getAll(match[0], json)

    if(obj.editable) {
      obj.value = json[obj.key]
      add(obj, json, util)
    } else {
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

export function orderByGroup(form) {
  var finalFields = []
  var groups = {}
  var groupIndex = {}
  var index = 0
  var items = form.item
  
  // sorting items by order
  items.sort(coreUtils.sort.predicatBy('order'))

  // grouping each group of elements and remembering there index in the finalOrder
  Array.prototype.forEach.call(items, (item) => {
    if(item.group != null && (item.block === '' || item.block == null)) {
      if(typeof groups[item.group] === 'undefined' || groups[item.group] === null){
        groupIndex[item.group] = index
        groups[item.group] = []
        index++
      }
      groups[item.group].push(item)
    }
    else {
      finalFields.push(item)
      index++
    } 
  })

  // ordering each group with first/last element and inserting the group elements in the final array at the right index.
  var shiftElts = 0
  for(var prop in groups){
    var group = groups[prop]

    group[0].firstgroup = 1
    group[group.length - 1].lastgroup = 1
    groupIndex[group[0].group] += shiftElts
    shiftElts = shiftElts + group.length - 1

    var args = [groupIndex[group[0].group], 0].concat(group)
    Array.prototype.splice.apply(finalFields, args)
  }

  return {item: finalFields}
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

    formBlock[tab] = formBlockTab
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

export function editor(text, json, precontrib = false) {
  let p = new Promise((resolve) => {
    var util = new cmsEditor.form()
    var arrayBlock = []

    // get all data from type='data' (web service, select, ...)
    // and create a key abe_source with all data
    // + modify keys when editable = false or prefill = true
    cmsData.source.getDataList(text, json)
      .then(() => {

        // prepare editor values id editable or put values in json from abe_source
        // (don't do this for type='data' included in {{#each}})
        addSource(text, json, util)

        // Remove every abe type='data' tags but those in {{#each}} statements
        text = cmsData.source.removeNonEachDataList(text)

        if (!precontrib) {
          text = cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist(text)
          text = cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist(text)
        }

        // add to the AST form abe tags
        matchAttrAbe(text, json, util, arrayBlock)
        arrayBlock = []

        // add to the AST the abe tags included in {{#each}}
        each(text, json, util, arrayBlock)

        // removing the type='data' in {{#each}} statements also (no more type='data')
        text = cmsData.source.removeDataList(text)

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
          form: blocks,
          json: json
        })
      }).catch(function(e) {
        console.error(e)
      })
  })

  return p
}