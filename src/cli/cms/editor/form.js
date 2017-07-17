import extend from 'extend'

import {coreUtils} from '../../'

export default class Form {
  constructor() {
    this._form = {}
    this._key = []
  }

  /**
   * Get all input from a template
   * @return {Array} array of input form
   */
  get form() {
    return this._form
  }

  /**
   * Check if key is not in the form array
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  contains(key) {
    return this._key[key] != null
  }

  /**
   * Add entry to abe engine form
   * @param {String} type        textarea | text | meta | link | image | ...
   * @param {String} key         unique ID, no space allowed
   * @param {String} desc        input description
   * @param {Int}    max-length   maximum characteres allowed inside input
   * @param {String} tab         tab name
   * @param {String} jsonValue   
   * @return {Void}
   */
  add(obj) {
    var defaultValues = {
      autocomplete: null,
      block: '',
      desc: '',
      display: null,
      editable: true,
      key: '',
      'max-length': null,
      order: 0,
      placeholder: '',
      prefill: false,
      'prefill-quantity': null,
      reload: false,
      required: false,
      source: null,
      tab: 'default',
      type: 'text',
      value: null,
      visible: true,
      precontribTemplate: ''
    }

    obj = extend(true, defaultValues, obj)

    if (obj.key.indexOf('[') < 0 && obj.key.indexOf('.') > -1) {
      obj.block = obj.key.split('.')[0]
    }

    if (this._form[obj.tab] == null) this._form[obj.tab] = {item: []}

    this._key[obj.key] = true // save key for contains()
    this._form[obj.tab].item.push(obj)
  }

  orderBlock() {
    var formBlock = {}

    for (var tab in this._form) {
      var formBlockTab = {}
      var formTab = this.orderByGroup(this._form[tab])
      for (var i = 0; i < formTab.item.length; i++) {
        var blockName =
          formTab.item[i].block === '' ? 'default_' + i : formTab.item[i].block
        if (formTab.item[i].key.indexOf('[') > -1) {
          blockName = formTab.item[i].key.split('[')[0]
        }
        if (
          typeof formBlockTab[blockName] === 'undefined' ||
          formBlockTab[blockName] === null
        ) {
          formBlockTab[blockName] = []
        }
        formBlockTab[blockName].push(formTab.item[i])
      }
      if (typeof blockName !== 'undefined' && blockName !== null) {
        formBlockTab[blockName].sort(this.orderByTabindex)
      }
      if (typeof formBlock[tab] === 'undefined' || formBlock[tab] === null) {
        formBlock[tab] = {}
      }

      formBlock[tab] = formBlockTab
    }

    var formTabsOrdered = {}
    var arKeysTabs = Object.keys(formBlock).sort((a, b) => {
      if (
        parseFloat(formBlock[a][Object.keys(formBlock[a])[0]][0].order) <
        parseFloat(formBlock[b][Object.keys(formBlock[b])[0]][0].order)
      ) {
        return -1
      } else if (
        parseFloat(formBlock[a][Object.keys(formBlock[a])[0]][0].order) >
        parseFloat(formBlock[b][Object.keys(formBlock[b])[0]][0].order)
      ) {
        return 1
      }
      return 0
    })

    Array.prototype.forEach.call(arKeysTabs, arKeysTab => {
      if (arKeysTab !== 'slug')
        formTabsOrdered[arKeysTab] = formBlock[arKeysTab]
    })

    formTabsOrdered['slug'] = formBlock['slug']

    return formTabsOrdered
  }

  orderByGroup(group) {
    var finalFields = []
    var groups = {}
    var groupIndex = {}
    var index = 0
    var items = group.item

    // sorting items by order
    items.sort(coreUtils.sort.predicatBy('order'))

    // grouping each group of elements and remembering there index in the finalOrder
    Array.prototype.forEach.call(items, item => {
      if (item.group != null && (item.block === '' || item.block == null)) {
        if (
          typeof groups[item.group] === 'undefined' ||
          groups[item.group] === null
        ) {
          groupIndex[item.group] = index
          groups[item.group] = []
          index++
        }
        groups[item.group].push(item)
      } else {
        finalFields.push(item)
        index++
      }
    })

    // ordering each group with first/last element and inserting the group elements in the final array at the right index.
    var shiftElts = 0
    for (var prop in groups) {
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

  orderByTabindex(a, b) {
    if (a.order < b.order) {
      return -1
    } else if (a.order > b.order) {
      return 1
    }

    return 0
  }
}
