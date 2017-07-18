/*global document, window, json, alert */

import {IframeNode} from '../utils/iframe'
import EditorUtils from './EditorUtils'
import Json from '../modules/EditorJson'
import on from 'on'
import {setObjByString} from '../utils/jsonObject'

export default class EditorSave {
  constructor() {
    this._json = Json.instance
    this._saveType = 'draft'

    this.onFileSaved = on(this)

    this._abeForm = document.querySelector('#abeForm')
    this._abeDisplayStatus = document.querySelector('[data-display-status]')
    this._abeFormSubmit = document.querySelector('#abeForm button[type=submit]')

    this._handleSubmitClick = this._submitClick.bind(this)

    this._btnSaves = document.querySelectorAll('.btn-save')
    Array.prototype.forEach.call(this._btnSaves, btnSave => {
      btnSave.addEventListener('click', this._handleSubmitClick)
    })

    var pageTpl = document.querySelector('#page-template')
    if (typeof pageTpl !== 'undefined' && pageTpl !== null) {
      document.querySelector('#page-template').addEventListener('load', () => {
        EditorUtils.checkAttribute()
      })
    }

    if (typeof this._abeForm !== 'undefined' && this._abeForm !== null) {
      this._formSubmit()
    }
  }

  /**
   * return abe form to json
   * @return {Object} json
   */
  serializeForm() {
    var abeForm = document.querySelector('.abeform-wrapper')
    if (abeForm == null) return
    var e = document.getElementById('selectTemplate')
    var selectedTemplate = e.options[e.selectedIndex].value
    var inputs = [].slice.call(abeForm.querySelectorAll('input'))
    var selects = [].slice.call(abeForm.querySelectorAll('select'))
    inputs = inputs.concat(selects)
    var textareas = [].slice.call(abeForm.querySelectorAll('textarea'))
    inputs = inputs.concat(textareas)

    this._json.data = json
    Array.prototype.forEach.call(inputs, input => {
      var dataId = input.getAttribute('data-id')
      var precontrib =
        input.parentNode.parentNode.getAttribute('data-precontrib-templates') !=
        null
          ? input.parentNode.parentNode.getAttribute(
              'data-precontrib-templates'
            )
          : input.parentNode.parentNode.parentNode.getAttribute(
              'data-precontrib-templates'
            )
      var maxlength = input.getAttribute('data-maxlength')
      var value

      if (input.type === 'file') return
      if (
        typeof dataId !== 'undefined' &&
        dataId !== null &&
        (precontrib == '' ||
          precontrib == null ||
          precontrib === selectedTemplate)
      ) {
        if (dataId.indexOf('[') > -1) {
          var obj = dataId.split('[')[0]
          var index = dataId.match(/[^\[]+?(?=\])/)[0]
          var key = dataId.replace(/[^\.]+?-/, '')
          if (
            typeof this._json.data[obj] === 'undefined' ||
            this._json.data[obj] === null
          )
            this._json.data[obj] = []
          if (
            typeof this._json.data[obj][index] === 'undefined' ||
            this._json.data[obj][index] === null
          )
            this._json.data[obj][index] = {}

          var keyJson = key.replace(/.*?\[[0-9].*?\]\./, '')
          if (input.getAttribute('data-autocomplete') === 'true') {
            var results = input.parentNode.querySelectorAll(
              '.autocomplete-result-wrapper .autocomplete-result'
            )
            value = []
            Array.prototype.forEach.call(results, result => {
              var val = result.getAttribute('value')
              if (val !== '') {
                if (val.indexOf('{') > -1 || val.indexOf('[') > -1) {
                  value.push(JSON.parse(val))
                } else {
                  value.push(val)
                }
              }
            })
          } else if (
            input.value.indexOf('{') > -1 ||
            input.value.indexOf('[') > -1
          ) {
            value = JSON.parse(input.value)
          } else {
            value = input.value
          }

          setObjByString(this._json.data[obj][index], keyJson, value)
          var emptyObject = 0
          for (var prop in this._json.data[obj][index]) {
            if (
              typeof this._json.data[obj][index][prop] !== 'string' ||
              this._json.data[obj][index][prop].trim() !== ''
            )
              emptyObject++
          }
          if (emptyObject === 0) {
            delete this._json.data[obj][index]
            if (this._json.data[obj].length == 1) delete this._json.data[obj]
          } else if (
            typeof input.getAttribute('data-size') !== null &&
            input.getAttribute('data-size') !== null
          ) {
            var sizes = input.getAttribute('data-size').split(',')
            for (var i = 0; i < sizes.length; i++) {
              var sizeValue = value.replace(
                /\.(jpg|jpeg|png|gif|svg)/,
                '_' + sizes[i] + '.$1'
              )
              setObjByString(
                this._json.data[obj][index],
                `${keyJson}_${sizes[i]}`,
                sizeValue
              )
            }
          }
        } else {
          if (
            input.getAttribute('data-autocomplete') === 'true' ||
            input.getAttribute('data-multiple') === 'multiple'
          ) {
            var results = input.parentNode.querySelectorAll(
              '.autocomplete-result-wrapper .autocomplete-result'
            )
            value = []
            Array.prototype.forEach.call(results, result => {
              var val = result.getAttribute('value')
              if (val !== '') {
                if (val.indexOf('{') > -1 || val.indexOf('[') > -1) {
                  value.push(JSON.parse(val))
                } else {
                  value.push(val)
                }
              }
            })
          } else if (
            input.value.indexOf('{') > -1 &&
            !input.classList.contains('abe-keep-format')
          ) {
            value = JSON.parse(input.value)
          } else {
            value = input.value
          }
          setObjByString(this._json.data, dataId, value)
        }
      }
    })
  }

  savePage(type) {
    var target = document.querySelector(`[data-action="${type}"]`)
    this.serializeForm()
    target.classList.add('loading')
    target.setAttribute('disabled', 'disabled')
    var url = target.getAttribute('data-url')

    this._json
      .save(this._saveType, url)
      .then(result => {
        target.classList.add('done')
        // this._populateFromJson(this._json.data)

        target.classList.remove('loading')
        target.classList.remove('done')
        target.removeAttribute('disabled')

        if (result.success === 1) {
          this._abeDisplayStatus.innerHTML = result.json.abe_meta.status
          window.json = result.json
        }
        var formWrapper = document.querySelector('#abeForm')
        Array.prototype.forEach.call(formWrapper.classList, classStr => {
          if (classStr.indexOf('status-') > -1)
            formWrapper.classList.remove(classStr)
        })
        formWrapper.classList.add('status-' + result.json.abe_meta.status)
        this.onFileSaved._fire()
      })
      .catch(function(e) {
        console.error(e)
      })
  }

  /**
   * Listen form submit and save page template 
   * @return {void}
   */
  _formSubmit() {
    this._abeForm.addEventListener('submit', e => {
      e.preventDefault()
      this.savePage(this._saveType)
    })
  }

  _submitClick(e) {
    this._saveType = e.currentTarget.getAttribute('data-action')
    if (this._saveType !== 'draft' && this._saveType !== 'reject') {
      this._abeFormRequired()
    } else {
      this.savePage(this._saveType)
      // this._abeFormSubmit.click()
    }
  }

  _abeFormRequired() {
    var formGroups = [].slice.call(
      document.getElementById('abeForm').querySelectorAll('.form-group')
    )
    var valid = true

    Array.prototype.forEach.call(formGroups, formGroup => {
      var input = formGroup.querySelector('[data-required=true]')
      if (typeof input !== 'undefined' && input !== null) {
        var required = input.getAttribute('data-required')

        var precontrib = formGroup.getAttribute('data-precontrib-templates')

        if (precontrib != null && precontrib != '') {
          if (precontrib != 'json.abe_meta.template') {
            return
          }
        }

        var autocomplete = input.getAttribute('data-autocomplete')
        var multiple = input.getAttribute('data-multiple')
        if (
          (typeof autocomplete !== 'undefined' &&
            autocomplete !== null &&
            (autocomplete === 'true' || autocomplete === true)) ||
          (multiple != null && multiple == 'multiple')
        ) {
          var countValue = input.parentNode.querySelectorAll(
            '.autocomplete-result'
          )
          if (countValue.length <= 0) {
            formGroup.classList.add('has-error')
            valid = false
          } else {
            formGroup.classList.remove('has-error')
          }
        } else if (
          typeof required !== 'undefined' &&
          required !== null &&
          (required === 'true' || required === true)
        ) {
          if (input.value === '') {
            formGroup.classList.add('has-error')
            valid = false
          } else {
            formGroup.classList.remove('has-error')
          }
        }
      }
    })

    if (valid) {
      this.savePage(this._saveType)
      // this._abeFormSubmit.click()
    } else {
      alert('Required fields are missing')
    }
  }

  /**
   * populate all form and iframe html with json
   * @param  {Object} json object with all values
   * @return {null}
   */
  _populateFromJson(json) {
    this._json.data = json
    var forms = document.querySelectorAll('.form-abe')
    Array.prototype.forEach.call(forms, form => {
      var id = form.getAttribute('data-id')
      if (
        typeof id != 'undefined' &&
        id !== null &&
        typeof json[id] != 'undefined' &&
        json[id] !== null
      ) {
        var value = json[id]
        if (
          typeof value === 'object' &&
          Object.prototype.toString.call(value) === '[object Array]'
        ) {
          value = JSON.stringify(value)
        } else if (
          typeof value === 'object' &&
          Object.prototype.toString.call(value) === '[object Object]'
        ) {
          value = JSON.stringify(value)
        }
        form.value = value

        var node = IframeNode(
          '#page-template',
          '[data-abe-' + id.replace(/\[([0-9]*)\]/g, '$1') + ']'
        )[0]
        EditorUtils.formToHtml(node, form)
      }
    })
  }
}
