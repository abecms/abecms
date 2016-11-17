import extend from 'extend'

export default class Form {

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
    return this._key[key] == null
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
      visible: true,
      precontribTemplate: ''
    }

    obj = extend(true, defaultValues, obj)
    obj.key = obj.key.replace(/\./, '-')

    if(obj.key.indexOf('[') < 0 && obj.key.indexOf('.') > -1) {
      obj.block = obj.key.split('.')[0]
    }
    
    if(this._form[obj.tab] == null) this._form[obj.tab] = {item:[]}

    this._key[obj.key] = true // save key for dontHaveKey()
    this._form[obj.tab].item.push(obj)
  }
}