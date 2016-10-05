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
}