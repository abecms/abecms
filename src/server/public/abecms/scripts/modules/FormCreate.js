/*global document, window, alert, slugs, CONFIG */

import limax from 'limax'
import Nanoajax from 'nanoajax'
import Handlebars from 'handlebars'
import qs from 'qs'
import FolderSelect from './FolderSelect'
import {setObjByString} from '../utils/jsonObject'

export default class FormCreate {
  constructor(parentForm) {
    this._form = parentForm
    if(typeof this._form !== 'undefined' && this._form !== null) {
      this._isSaving = false

      // constantes variables
      this._ajax = Nanoajax.ajax

      // constantes variables DOM elements
      this._previewPostPath = this._form.querySelector('[data-post-path-preview]')

      this._formInputs = [].slice.call(this._form.querySelectorAll('input, select'))
      this._precontribTemplate = [].slice.call(this._form.querySelectorAll('[data-precontrib-templates]'))

      this._selectTemplate = this._form.querySelector('[data-id="abe_meta.template"]') 
      this._showHideSelect(this._selectTemplate)
      this._handleBtnSelectTemplate = this._btnSelectTemplate.bind(this)

      // // manager update btn
      this._btnCreate = this._form.querySelector('[data-abe-create]')
      this._btnUpdate = this._form.querySelector('[data-abe-update]')
      this._btnDuplicate = this._form.querySelector('[data-abe-duplicate]')
      this._handleBtnDuplicateManagerClick = this._btnDuplicateManagerClick.bind(this)
      this._handleBtnUpdateManagerClick = this._btnUpdateManagerClick.bind(this)
      this._handleBtnCreateManagerClick = this._btnCreateManagerClick.bind(this)
      this._handleBlurEvent = this._blurEvent.bind(this)

      // // init modules
      new FolderSelect(this._form)

      this._bindEvents()

      this._setSlug(false)
    }

    window.abe.blocks.onNewBlock(() => {
      this._formInputs = [].slice.call(this._form.querySelectorAll('input, select'))
      Array.prototype.forEach.call(this._formInputs, function(input) {
        input.removeEventListener('blur', this._handleBlurEvent)
        input.addEventListener('blur', this._handleBlurEvent)
      }.bind(this))
    })
  }

  _bindEvents() {
    if(typeof this._btnUpdate !== 'undefined' && this._btnUpdate !== null) {
      this._btnUpdate.addEventListener('click', this._handleBtnUpdateManagerClick) // click update metadata
    }
    if(typeof this._btnCreate !== 'undefined' && this._btnCreate !== null) {
      this._btnCreate.addEventListener('click', this._handleBtnCreateManagerClick) // click update metadata
    }
    if(typeof this._btnDuplicate !== 'undefined' && this._btnDuplicate !== null) {
      this._btnDuplicate.addEventListener('click', this._handleBtnDuplicateManagerClick) // click duplicate content
    }
    if(typeof this._form !== 'undefined' && this._form !== null) {
      this._form.addEventListener('submit', this._handleSubmit)
    }
    if(typeof this._selectTemplate !== 'undefined' && this._selectTemplate !== null) {
      this._selectTemplate.addEventListener('change', this._handleBtnSelectTemplate)
    }

    Array.prototype.forEach.call(this._formInputs, function(input) {
      input.addEventListener('blur', this._handleBlurEvent)
    }.bind(this))
  }

  _blurEvent() {
    this._setSlug(false)
  }

  _showHideSelect(target) {
    this._selectedTemplate = target.value
    Array.prototype.forEach.call(this._precontribTemplate, function(input) {
      var linkedTpl = input.getAttribute('data-precontrib-templates').split(',')
      var found = false
      Array.prototype.forEach.call(linkedTpl, function(tpl) {
        if (tpl === this._selectedTemplate) {
          found = true
        }
      }.bind(this))

      if (found) {
        input.style.display = 'block'
      } else {
        input.style.display = 'none'
      }
    }.bind(this))
  }

  _btnSelectTemplate(e) {
    this._showHideSelect(e.currentTarget)
  }

  _setSlug(showErrors) {
    var values = {}
    var postPath = ''
    var isValid = true
    if (this._selectedTemplate != null && this._selectedTemplate != '') {
      Array.prototype.forEach.call(this._formInputs, function(input) {
        if (input.getAttribute('data-slug-type') == 'path') {
          if (input.parentNode.classList.contains('hidden')) {
            return
          }
        }

        var parentNode = input.parentNode.parentNode
        if (parentNode.getAttribute('data-precontrib-templates') == null) {
          parentNode = parentNode.parentNode
        }
        parentNode.classList.remove('has-error')
        var linkedTpl = parentNode.getAttribute('data-precontrib-templates')
        input.parentNode.classList.remove('error')
        if (linkedTpl == null || linkedTpl == this._selectedTemplate) {
          var id = input.getAttribute('data-id')
          if (id != null) {
            var autocomplete = input.getAttribute('data-autocomplete') == 'true' ? true : false
            var required = input.getAttribute('data-required') == 'true' ? true : false
            var value = input.value
            var maxlength = input.getAttribute('data-maxlength')
            
            var singleValues = values
            if(id.indexOf('[') > -1) {
              var regexBlock = /(.*?)\[(\d*?)\]\.(.+)/
              var match = regexBlock.exec(id)
              if (values[match[1]] == null) {
                values[match[1]] = []
              }
              if (values[match[1]][match[2]] == null) {
                values[match[1]][match[2]] = {}
              }
              addTo = values[match[1]][match[2]]
              id = id.replace(/.+\[.+\]\./, '')
            }
            //else
            if (input.nodeName === 'SELECT' && maxlength != '1') {
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
              setObjByString(addTo, id, value)
            } else if (autocomplete) {
              var results = input.parentNode.querySelectorAll('.autocomplete-result')
              addTo[id] = []
              var mergedValues = []
              Array.prototype.forEach.call(results, function(result) {
                var resultValue = result.getAttribute('value')
                if (resultValue.indexOf('{') > -1) {
                  try {
                    var jsonValue = JSON.parse(resultValue)
                    mergedValues.push(jsonValue)
                  }catch(e) {
                    mergedValues.push(value)
                  }
                }
              }.bind(this))
              setObjByString(addTo, id, mergedValues)
              if (required && addTo[id].length == 0) {
                isValid = false
                if(showErrors) parentNode.classList.add('has-error')
              }
            } else {
              if (value.indexOf('{') > -1) {
                try {
                  var jsonValue = JSON.parse(value)
                  setObjByString(addTo, id, jsonValue)

                  if (required && addTo[id].length == 0) {
                    isValid = false
                    if(showErrors) parentNode.classList.add('has-error')
                  }
                }catch(e) {
                  // values[id].push(value)
                }
              } else {
                setObjByString(addTo, id, value)
                if (required && addTo[id] == '') {
                  isValid = false
                  if(showErrors) parentNode.classList.add('has-error')
                }
              }
            }
          }
        }
      }.bind(this))

      var slug = slugs[this._selectedTemplate]
      var template = Handlebars.compile(slug)
      slug = template(values)
      slug = slug.replace(/\/g/, '__abe_escape_slash__')
      slug = limax(slug, {separateNumbers: false})
      slug = slug.replace(/__abe_escape_slash__/g, '/')

      var slugPaths = this._form.querySelectorAll('[data-slug-type=path]')
      Array.prototype.forEach.call(slugPaths, function(slugPath) {
        var isStructureFolder = (slugPath.parentNode.getAttribute('data-shown') != null)
        if (slugPath.value != null && slugPath.value != '' && (isStructureFolder && !slugPath.parentNode.classList.contains('hidden'))) {
          postPath += slugPath.value + '/'
        }
      })
      postPath +=  slug.replace(/^\//, '').replace(/\/\//, '/')
    } else {
      isValid = false
    }

    var breadcrumbs = postPath.split('/')
    var breadcrumbsHtml = ''
    Array.prototype.forEach.call(breadcrumbs, function(breadcrumb) {
      var breadcrumbNames = breadcrumb.split('-')
      breadcrumbsHtml += '<li>'
      Array.prototype.forEach.call(breadcrumbNames, function(breadcrumbName) {
        if (breadcrumbName == '' && showErrors) {
          breadcrumbsHtml += '<span class="btn-danger">...</span>-'
        } else {
          breadcrumbsHtml += '<span>' + breadcrumbName + '</span>-'
        }
      }.bind(this))
      breadcrumbsHtml = breadcrumbsHtml.replace(/-$/, '')
      breadcrumbsHtml += '</li>'
    })
    breadcrumbsHtml += '<span>.' + CONFIG.EXTENSION + '</span>'
    this._previewPostPath.innerHTML = '<span>URL : </span>' + breadcrumbsHtml

    return {
      isValid: isValid,
      postPath: postPath,
      values: values
    }
  }

  _submit(type) {
    var res = this._setSlug(true)
    var toSave = qs.stringify(res.values)

    if (res.isValid && !this._isSaving) {
      this._isSaving = true
      this._ajax(
        {
          url: document.location.origin + '/abe/' + type + '/' + res.postPath,
          body: toSave,
          headers: {},
          method: 'post'
        },
        (code, responseText) => {
          this._isSaving = false
          var jsonRes = JSON.parse(responseText)
          if (jsonRes.success == 1 && jsonRes.json != null && jsonRes.json.abe_meta != null) {
            window.location.href = window.location.origin + '/abe/editor' + jsonRes.json.abe_meta.link
          }else {
            console.log(responseText)
            alert('error')
          }
        }
      )
    }
  }

  _btnDuplicateManagerClick(e) {
    e.preventDefault()
    this._submit('duplicate')
  }

  _btnUpdateManagerClick(e) {
    e.preventDefault()
    this._submit('update')
  }

  _btnCreateManagerClick(e) {
    e.preventDefault()
    this._submit('create')
  }
}