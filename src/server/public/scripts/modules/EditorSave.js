import {IframeNode} from '../utils/iframe'
import EditorUtils from './EditorUtils'
import Json from '../modules/EditorJson'

export default class EditorSave {
  constructor() {
    this._json = Json.instance
    this._saveType = 'draft'

    this._abeForm = document.querySelector('#abeForm')
    this._abeFormSubmit = document.querySelector('#abeForm button[type=submit]')

    this._handleSubmitClick = this._submitClick.bind(this)

    this._btnSaves = document.querySelectorAll('.btn-save')
    Array.prototype.forEach.call(this._btnSaves, (btnSave) => {
      btnSave.addEventListener('click', this._handleSubmitClick)
    })

    var pageTpl = document.querySelector('#page-template')
    if(typeof pageTpl !== 'undefined' && pageTpl !== null) {
      document.querySelector('#page-template').addEventListener('load', () => {
        EditorUtils.checkAttribute()
      })
    }

    if(typeof this._abeForm !== 'undefined' && this._abeForm !== null) {
      this._formSubmit()
    }
  }

  /**
   * return abe form to json
   * @return {Object} json
   */
  serializeForm() {
    var inputs = [].slice.call(document.getElementById('abeForm').querySelectorAll('input'))
    var selects = [].slice.call(document.getElementById('abeForm').querySelectorAll('select'))
    inputs = inputs.concat(selects)
    var textareas = [].slice.call(document.getElementById('abeForm').querySelectorAll('textarea'))
    inputs = inputs.concat(textareas)

    this._json.data = json

    Array.prototype.forEach.call(inputs, (input) => {
      var dataId = input.getAttribute('data-id')
      if(input.type === 'file') return;
      if(typeof dataId !== 'undefined' && dataId !== null) {
        if(dataId.indexOf('[') > -1){
          var obj = dataId.split('[')[0]
          var index = dataId.match(/[^\[]+?(?=\])/)[0]
          var key = dataId.replace(/[^\.]+?-/, '')
          if(typeof this._json.data[obj] === 'undefined' || this._json.data[obj] === null) this._json.data[obj] = []
          if(typeof this._json.data[obj][index] === 'undefined' || this._json.data[obj][index] === null) this._json.data[obj][index] = {}
          this._json.data[obj][index][key] = input.value
        }else {
          var value

          if (input.nodeName === 'SELECT') {
            var checked = input.querySelectorAll('option:checked')
              value = []
              Array.prototype.forEach.call(checked, (check) => {
                if(check.value !== '') {
                  if(check.value.indexOf('{') > -1 || check.value.indexOf('[') > -1) {
                    value.push(JSON.parse(check.value))
                  }else {
                    value.push(check.value)
                  }
                }
              })
          }else if (input.getAttribute('data-autocomplete') === 'true') {
            var results = input.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result')
              value = []
              Array.prototype.forEach.call(results, (result) => {
                var val = result.getAttribute('value')
                if(val !== '') {
                  if(val.indexOf('{') > -1 || val.indexOf('[') > -1) {
                    value.push(JSON.parse(val))
                  }else {
                    value.push(val)
                  }
                }
              })
          }else {
            value = input.value.replace(/\"/g, '\&quot;') + ""
          }
          this._json.data[dataId] = value
        }
      }
    })
  }

  savePage(type, tplName = null, filePath = null) {
      var target = document.querySelector(`[data-action="${type}"]`)
      this.serializeForm()
      target.classList.add('loading')
      target.setAttribute('disabled', 'disabled');

      this._json.save(this._saveType)
        .then((result) => {
          target.classList.add('done');
          // this._populateFromJson(this._json.data)
          if(result.success === 1) {
            CONFIG.TPLNAME = result.json.abe_meta.latest.abeUrl
            if(CONFIG.TPLNAME[0] === '/') CONFIG.TPLNAME = CONFIG.TPLNAME.slice(1)
          }

          var tplNameParam = '?tplName='
          var filePathParam = '&filePath='

          var getParams = window.location.search.slice(1).split('&')
          getParams.forEach(function (getParam) {
            var param = getParam.split('=')
            if(param[0] === 'tplName'){
              tplNameParam += param[1]
            }
            if(param[0] === 'filePath'){
              if(param[1].indexOf('-abe-') > -1){
                filePathParam += CONFIG.TPLNAME
              }
              else{
                filePathParam += param[1]
              }
            }
          })
          var ext = filePathParam.split('.')
          ext = ext[ext.length - 1]
          filePathParam = filePathParam.replace(new RegExp('-abe-(.+?)(?=\.' + ext + ')'), '')
          var reloadUrl = top.location.protocol + '//' + window.location.host + window.location.pathname + tplNameParam + filePathParam
          
          target.classList.remove('loading')
          target.classList.remove('done')
          target.removeAttribute('disabled')
          if(result.success === 1) window.location.href = reloadUrl;
        }).catch(function(e) {
          console.error(e)
        })
  }

  /**
   * Listen form submit and save page template 
   * @return {void}
   */
  _formSubmit(target) {
    this._abeForm.addEventListener('submit', (e) => {
      e.preventDefault()
      this.savePage(this._saveType)
    })
  }

  _submitClick(e) {
    this._saveType = e.currentTarget.getAttribute('data-action')
    this._abeFormSubmit.click()
  }

  /**
   * populate all form and iframe html with json
   * @param  {Object} json object with all values
   * @return {null}
   */
  _populateFromJson(json) {
    this._json.data = json
    var forms = document.querySelectorAll('.form-abe')
    Array.prototype.forEach.call(forms, (form) => {
      var id = form.getAttribute('data-id')
      if(typeof id != 'undefined' && id !== null && typeof json[id] != 'undefined' && json[id] !== null) {
        var value = json[id]
        if(typeof value === 'object' && Object.prototype.toString.call(value) === '[object Array]') {
          value = JSON.stringify(value)
        }else if(typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]') {
          value = JSON.stringify(value)
        }
        form.value = value

        var dataIdLink = form.getAttribute('data-id-link')
        var node = IframeNode('#page-template', '[data-abe-' + id.replace(/\[([0-9]*)\]/g, '$1') + ']')[0]
        EditorUtils.formToHtml(node, form)
      }
    })
  }
}	