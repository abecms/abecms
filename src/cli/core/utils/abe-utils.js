import extend from 'extend'
import clc from 'cli-color'
import fse from 'fs-extra'
import ajaxRequest from 'ajax-request'
import {Promise} from 'es6-promise'
import http from 'http' 
import https from 'https'
import path from 'path'

import {
  config
  ,cmsData
  ,folderUtils
  ,fileUtils
  ,FileParser
  ,dateSlug
  ,dateUnslug
  ,Hooks
  ,Plugins
} from '../../'

export default class Utils {

  constructor() {
    this._form = {
      
    }
    this._key = []
  }

  /**
   * Get all input from a template
   * @return {Array} array of input form
   */
  get form(){
    return this._form
  }

  /**
   * Check if key is not is the form array
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  dontHaveKey(key){
    return typeof this._key[key] === 'undefined' || this._key[key] === null
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
      block:'',
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
      value: '',
      visible: true
    }

    obj = extend(true, defaultValues, obj)
    obj.key = obj.key.replace(/\./, '-')

    if(obj.key.indexOf('[') < 0 && obj.key.indexOf('.') > -1) {
      obj.block = obj.key.split('.')[0]
    }

    if(typeof this._form[obj.tab] === 'undefined' || this._form[obj.tab] === null) this._form[obj.tab] = {item:[]}

    this._key[obj.key] = true // save key for dontHaveKey()
    this._form[obj.tab].item.push(obj)
  }

  static sanitizeSourceAttribute(obj, jsonPage){
    if(typeof obj.sourceString !== 'undefined' && obj.sourceString !== null && obj.sourceString.indexOf('{{') > -1) {
      var matches = obj.sourceString.match(/({{[a-zA-Z._]+}})/g)
      if(matches !== null) {
        Array.prototype.forEach.call(matches, (match) => {
          var val = match.replace('{{', '')
          val = val.replace('}}', '')
          
          try {
            val = eval('jsonPage.' + val)
          }catch(e) {
            val = ''
          }
          obj.sourceString = obj.sourceString.replace(match, val)
        })
      }
    }

    return obj
  }

  static replaceUnwantedChar(str) {
    var chars = {'’': '', '\'': '', '"': '', 'Š': 'S', 'š': 's', 'Ž': 'Z', 'ž': 'z', 'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'A', 'Ç': 'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I', 'Ï': 'I', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ý': 'Y', 'Þ': 'B', 'ß': 'Ss', 'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a', 'æ': 'a', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e', 'œ': 'oe', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'o', 'ñ': 'n', 'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ø': 'o', 'ù': 'u', 'ú': 'u', 'û': 'u', 'ý': 'y', 'þ': 'b', 'ÿ': 'y'}
    for(var prop in chars) str = str.replace(new RegExp(prop, 'g'), chars[prop])
    return str
  }
}