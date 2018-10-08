import {Promise} from 'bluebird'
import path from 'path'

import {
  coreUtils,
  cmsData,
  cmsEditor,
  abeEngine,
  cmsTemplates,
  abeExtend
} from '../../'

export function add(obj, json, form) {
  var value = obj.value

  if (obj.key.indexOf('[') > -1) {
    var key = obj.key.split('[')[0]
    var index = obj.key.match(/[^\[]+?(?=\])/)[0]
    var prop = obj.key.replace(/[^\.]+?\./, '')

    try {
      obj.value = eval(`json[key][index].${prop}`)
    } catch (e) {
      try {
        eval(`json[key][index].${prop} = ` + JSON.stringify(value))
      } catch (e) {
        // no value found inside json KEY
      }
    }
  } else {
    try {
      if (obj.key.indexOf('.') > -1)
        obj.value = eval(`json["${obj.key.split('.').join('"]["')}"]`)
      else obj.value = eval(`json["${obj.key}"]`)
    } catch (e) {
      // no value found inside json KEY
    }
  }

  if (json != null && json.abe_meta != null) {
    obj.status = json.abe_meta.status
  }

  form.add(obj)

  return obj.value
}

export function addAbeTagToCollection(
  match,
  text,
  json,
  form,
  arrayBlock,
  keyArray = null,
  i = 0
) {
  var obj = cmsData.attributes.getAll(match, json)

  if (typeof keyArray !== 'undefined' && keyArray !== null) {
    // removes the first part of the key. ie. 'main.article' becomes 'article'
    var realKey = obj.key.replace(/[^\.]+?\./, '')

    if (obj.key.indexOf(keyArray + '.') >= 0 && realKey.length > 0) {
      obj.keyArray = keyArray
      obj.realKey = realKey
      obj.key = keyArray + '[' + i + '].' + realKey
      obj.desc = obj.desc + ' ' + i
      insertAbeEach(obj, text, json, form, arrayBlock)
    } else if (!form.contains(obj.key)) {
      obj.value = json[obj.key]
      json[obj.key] = add(obj, json, form)
    }
  }
}

/**
 * parse every abe tags, 
 * create the defaultValue attribute if it finds a value in 'value' attribute
 * If the abe tag object contains a key and is not already put in the form
 * and is not included in a #each statement, I update its value and
 * add it to the form
 *
 * @param  {[type]} text       [description]
 * @param  {[type]} json       [description]
 * @param  {[type]} form       [description]
 * @return {[type]}            [description]
 */
export function addSingleAbeTagsToForm(text, json, form) {
  var match

  while ((match = cmsData.regex.abeTag.exec(text))) {
    var matchText = match[0].replace(
      /value=([\'\"].*?[\'\"])/g,
      'defaultValue=$1'
    )
    var obj = cmsData.attributes.getAll(matchText, json)

    if (
      obj.key != '' &&
      obj.type != '' &&
      !form.contains(obj.key) &&
      cmsData.regex.isSingleAbe(match, text)
    ) {
      if (json[obj.key]) {
        obj.value = json[obj.key]
      } else {
        obj.value = null
      }

      add(obj, json, form)
    }
  }
}

export function insertAbeEach(obj, text, json, form, arrayBlock) {
  if (
    typeof arrayBlock[obj.keyArray][obj.realKey] === 'undefined' ||
    arrayBlock[obj.keyArray][obj.realKey] === null
  ) {
    arrayBlock[obj.keyArray][obj.realKey] = []
  }
  var exist = false
  Array.prototype.forEach.call(arrayBlock[obj.keyArray][obj.realKey], block => {
    if (block.key === obj.key) {
      exist = true
    }
  })
  if (!exist) {
    arrayBlock[obj.keyArray][obj.realKey].push(obj)
  }
}

/**
 * parse every {{#each name}} texts, then select each abe tag included and create
 * an array of these tags in arrayBlock[name]
 * Then reorder these tags and add them to form
 *
 * @param  {[type]} text       [description]
 * @param  {[type]} json       [description]
 * @param  {[type]} form       [description]
 * @param  {[type]} arrayBlock [description]
 * @return {[type]}            [description]
 */
export function addAbeTagCollectionToForm(text, json, form, arrayBlock) {
  var textEach
  var match

  while ((textEach = cmsData.regex.eachBlockPattern.exec(text))) {
    var i
    var keyArray = textEach[2].split(' ')[0]
    var attrArray = []
    var length = 0

    arrayBlock[keyArray] = []

    while ((match = cmsData.regex.abeTag.exec(textEach[0]))) {
      if (json[keyArray]) {
        for (i = 0; i < json[keyArray].length; i++) {
          addAbeTagToCollection(
            match[0],
            text,
            json,
            form,
            arrayBlock,
            keyArray,
            i
          )
        }
      } else {
        addAbeTagToCollection(
          match[0],
          text,
          json,
          form,
          arrayBlock,
          keyArray,
          0
        )
      }
    }

    // Let's reorder the fields and add it to the form
    for (var index in arrayBlock[keyArray]) {
      attrArray.push(index)
      length = arrayBlock[keyArray][index].length
    }

    for (i = 0; i < length; i++) {
      for (var j = 0; j < attrArray.length; j++) {
        add(arrayBlock[keyArray][attrArray[j]][i], json, form)
      }
    }
  }
}

/**
 * Removing all type='data' included in {{#each}} statements
 * Then if editable, obj.value = json[obj.key]
 * else put the source values in the json[obj.key]
 * if not editable, put the json value with values from source
 *
 * @param {[type]} text [description]
 * @param {[type]} json [description]
 * @param {[type]} form [description]
 */
export function addDataAbeTagsToForm(text, json, form) {
  // removing each blocks potentially containing abe data type
  text = text.replace(cmsData.regex.eachBlockPattern, '')

  const matches = cmsData.regex.getTagAbeTypeRequest(text)

  Array.prototype.forEach.call(matches, match => {
    var obj = cmsData.attributes.getAll(match[0], json)

    if (obj.editable) {
      obj.value = json[obj.key]
      add(obj, json, form)
    } else {
      json[obj.key] = obj.source
    }
  })
}

export function create(text, json, precontrib = false) {
  let p = new Promise(resolve => {
    var form = new cmsEditor.form()
    var arrayBlock = []

    // get all data from type='data' (web service, select, ...)
    // and create a key abe_source with all data
    // + modify keys when editable = false or prefill = true only in the case of source=select
    cmsData.source
      .getDataList(text, json)
      .then(() => {
        // prepare editor values if editable or put values in json from abe_source
        // (don't do this for type='data' included in {{#each}})
        addDataAbeTagsToForm(text, json, form)

        // Remove every abe type='data' tags else but those in {{#each}} statements
        text = cmsData.source.removeNonEachDataList(text)

        if (!precontrib) {
          text = cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist(text)
          text = cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist(
            text
          )
        }

        // add abe tags not in each and with a key to the form
        addSingleAbeTagsToForm(text, json, form)

        // add abe tags in each
        addAbeTagCollectionToForm(text, json, form, arrayBlock)

        if (!precontrib) {
          // HOOKS beforeEditorFormBlocks
          json = abeExtend.hooks.instance.trigger(
            'beforeEditorFormBlocks',
            json,
            text
          )
        }

        var blocks = form.orderBlock()

        if (!precontrib) {
          // HOOKS afterEditorFormBlocks
          blocks = abeExtend.hooks.instance.trigger(
            'afterEditorFormBlocks',
            blocks,
            json,
            text
          )
        }

        abeEngine.instance.content = json
        resolve({
          form: blocks,
          json: json
        })
      })
      .catch(function(e) {
        console.error(e)
      })
  })

  return p
}
