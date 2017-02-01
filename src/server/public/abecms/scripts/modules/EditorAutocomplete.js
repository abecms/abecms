/*global document, json */

import EditorUtils from '../modules/EditorUtils'
import Json from '../modules/EditorJson'
import {IframeCommentNode} from '../utils/iframe'
import Handlebars from 'handlebars'
import Nanoajax from 'nanoajax'
import on from 'on'
import qs from 'qs'
import dragula from 'dragula'

export default class EditorAutocomplete {
  constructor() {
    this._ajax = Nanoajax.ajax
    this._json = Json.instance
    this.onReload = on(this)
    this._previousValue = ''

    this._handleKeyUp = this._keyUp.bind(this)
    this._handleKeyDown = this._keyDown.bind(this)
    this._handleFocus = this._focus.bind(this)
    this._handleBlur = this._blur.bind(this)
    this._handleRemove = this._remove.bind(this)
    this._handleDocumentClick = this._documentClick.bind(this)
    this._handleSelectValue = this._selectValue.bind(this)
    this._handleChangeSelect = this._changeSelect.bind(this)
    this._handleRefresh = this._refresh.bind(this)

    this._currentInput = null
    this._divWrapper = document.createElement('div')
    this._divWrapper.classList.add('autocomplete-wrapper')

    this._visible = false

    this._dragAutocomplete = document.querySelectorAll('.autocomplete-result-wrapper')
    Array.prototype.forEach.call(this._dragAutocomplete, (drag) => {
      var drake = dragula([drag])
      drake.on('drag', (el, source) => {
        el.classList.add('moving')
      })
      drake.on('dragend', (el) => {
        el.classList.remove('moving')
        var input = el.parentNode.parentNode.querySelector('input')
        if(input == null) {
          input = el.parentNode.parentNode.querySelector('select')
        }
        this._currentInput = input
        this._saveData()
      })
    })

    this.rebind()
  }

  rebind() {
    this._selectsMultiple = [].slice.call(document.querySelectorAll('select[data-multiple="multiple"]'))
    this._autocompletesRemove = [].slice.call(document.querySelectorAll('[data-autocomplete-remove=true]'))
    this._autocompletes = [].slice.call(document.querySelectorAll('[data-autocomplete=true]'))
    this._autocompletesRefresh = [].slice.call(document.querySelectorAll('[data-autocomplete-refresh=true]'))

    document.body.removeEventListener('mouseup', this._handleDocumentClick)
    document.body.addEventListener('mouseup', this._handleDocumentClick)

    Array.prototype.forEach.call(this._autocompletesRemove, (autocompleteRemove) => {
      autocompleteRemove.addEventListener('click', this._handleRemove)
    })

    Array.prototype.forEach.call(this._autocompletesRefresh, (autocompletesRefresh) => {
      autocompletesRefresh.removeEventListener('click', this._handleRefresh)
      autocompletesRefresh.addEventListener('click', this._handleRefresh)
    })

    Array.prototype.forEach.call(this._autocompletes, (autocomplete) => {
      document.body.removeEventListener('keydown', this._handleKeyDown)
      document.body.addEventListener('keydown', this._handleKeyDown)
      autocomplete.removeEventListener('keyup', this._handleKeyUp)
      autocomplete.addEventListener('keyup', this._handleKeyUp)
      autocomplete.removeEventListener('focus', this._handleFocus)
      autocomplete.addEventListener('focus', this._handleFocus)
      autocomplete.removeEventListener('blur', this._handleBlur)
      autocomplete.addEventListener('blur', this._handleBlur)
    })

    Array.prototype.forEach.call(this._selectsMultiple, (select) => {
      select.removeEventListener('change', this._handleChangeSelect)
      select.addEventListener('change', this._handleChangeSelect)
    })
  }

  _changeSelect(e) {
    var target = e.currentTarget
    var option = target.querySelector('option:checked')
    this._currentInput = target
    this._addResult(option, target.parentNode.getAttribute('data-display'), target.parentNode.querySelector('.autocomplete-result-wrapper'))
    target.selectedIndex = 0
  }

  _saveData() {
    var id = this._currentInput.getAttribute('data-id')
    var nodeComments = IframeCommentNode('#page-template', id.replace(/\./g, '-'))
    var maxLength = this._currentInput.getAttribute('data-maxlength')

    if(typeof maxLength !== 'undefined' && maxLength !== null && maxLength !== '') {
      maxLength = parseInt(maxLength)
      var countLength = [].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result')).length
      if(countLength === maxLength) {
        this._currentInput.value = ''
        this._divWrapper.parentNode.removeChild(this._divWrapper)
        this._currentInput.setAttribute('disabled', 'disabled')
      }else {
        this._currentInput.removeAttribute('disabled')
      }
    }

    var results = [].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result'))
    var json = this._json.data
    
    var toSave = []
    Array.prototype.forEach.call(results, (result) => {
      var value = result.getAttribute('value')
      if(value !== '') {
        if(value.indexOf('{') > -1 || value.indexOf('[') > -1) {
          toSave.push(JSON.parse(value))
        }else {
          toSave.push(value)
        }
      }
    })
    eval(`json.${id} = ${JSON.stringify(toSave)}`)

    this._json.data = json
    if(typeof nodeComments !== 'undefined' && nodeComments !== null && nodeComments.length > 0) {
      
      try {
        Array.prototype.forEach.call(nodeComments, (nodeComment) => {
          var blockHtml = unescape(nodeComment.textContent.replace(/\[\[([\S\s]*?)\]\]/, '')).replace(/\[0\]-/g, '[0]-')

          // var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]-/g, '[0]-')
          var template = Handlebars.compile(blockHtml, {noEscape: true})
          var compiled = template(this._json.data)

          nodeComment.parentNode.innerHTML = compiled + `<!-- ${nodeComment.textContent} -->`
        })
      } catch(e) {
        console.log(e)
      }

    }else if(typeof id !== 'undefined' && id !== null) {
      if (this._currentInput.getAttribute('visible') === true) {
        var nodes = EditorUtils.getNode(attr)
        Array.prototype.forEach.call(nodes, (node) => {
          EditorUtils.formToHtml(node, this._currentInput)
        })
      }
    }

    this.onReload._fire()
  }

  _documentClick() {
    if(this._visible && !this._canSelect) {
      if(typeof this._divWrapper.parentNode !== 'undefined' && this._divWrapper.parentNode !== null) {
        this._hide()
      }
    }
  }

  _add(display, value, json, autocompleteResultWrapper) {
    var div = document.createElement('div')
    div.classList.add('autocomplete-result')
    div.setAttribute('data-parent-id', this._currentInput.getAttribute('data-id'))
    div.setAttribute('value', value.replace(/&quote;/g, '\''))
    div.innerHTML = this._prepareDisplay(json, display)

    var remove = document.createElement('span')
    remove.classList.add('glyphicon', 'glyphicon-remove')
    remove.setAttribute('data-autocomplete-remove', 'true')
    remove.addEventListener('click', this._handleRemove)
    div.appendChild(remove)

    autocompleteResultWrapper.appendChild(div)
  }

  _select(target) {
    this._addResult(target, this._currentInput.getAttribute('data-display'), this._divWrapper.parentNode.querySelector('.autocomplete-result-wrapper'))
  }

  _addResult(target, display, resultWrapper) {
    var json = target.getAttribute('data-value').replace(/&quote;/g, '\'')
    if (json.indexOf('{') > -1) {
      json = JSON.parse(json)
    }
    var maxLength = this._currentInput.getAttribute('data-maxlength')
    if(typeof maxLength !== 'undefined' && maxLength !== null && maxLength !== '') {
      maxLength = parseInt(maxLength)
      var countLength = [].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result')).length
      if(countLength+1 > maxLength) {
        return
      }
    }

    this._add(
      display,
      target.getAttribute('data-value'),
      json,
      resultWrapper
    )
    this._saveData()
  }

  _selectValue(e) {
    this._select(e.currentTarget)
  }

  _showAutocomplete(obj, target, val) {
    var first = true
    var str = target.getAttribute('data-display')
    this._divWrapper.innerHTML = ''
    this.result = []
    var keys = this._getKeys(str)
    var key = keys[0]
    this._find(obj, key)
    Array.prototype.forEach.call(this.result, (o) => {

      var displayName = this._prepareDisplay(o, str, keys)
      if (displayName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
        var div = document.createElement('div')
        div.addEventListener('mousedown', this._handleSelectValue)
        div.setAttribute('data-value', (typeof o == 'object') ? JSON.stringify(o) : o)
        div.setAttribute('data-display', displayName)
        if(first) {
          div.classList.add('selected')
        }
        first = false
        div.innerHTML = displayName.replace(new RegExp(`(${val})`, 'i'), '<span class="select">$1</span>')
        this._divWrapper.appendChild(div)
      }
    })

    this._show(target)
  }

  /**
   * add in array the object containing the object path if it exists in obj
   * @param  {Object}  obj  json object
   * @param  {string}  path the path to object (dot notation)
   */
  _find(obj, path) {
    if (path == null) {
      this.result = obj
    }else {
      if (this._has(obj, path)) {
        this.result.push(obj)
      }
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if ('object' == typeof(obj[key]) && !this._has(obj[key], path)) {
            this._find(obj[key], path)
          } else if (this._has(obj[key], path)) {
            this.result.push(obj[key])
          }
        }
      }
    }
  }

  /**
   * return true if the object path exist in obj
   * @param  {Object}  obj  json object
   * @param  {string}  path the path to object (dot notation)
   * @return {Boolean}      is the path found in obj
   */
  _has(obj, path) {
    return path.split('.').every(function(x) {
      if(typeof obj != 'object' || obj === null || typeof obj[x] == 'undefined')
        return false
      obj = obj[x]
      return true
    })
  }

  /**
   * return the value from a json obj of a nested attribute
   * @param  {Object} obj  the json object
   * @param  {string} path the path to object (dot notation)
   * @return {[type]}      the object containing the path object or undefined
   */
  _get(obj, path) {
    return path.split('.').reduce(function(prev, curr) {
      return prev ? prev[curr] : undefined
    }, obj || this)
  }

  /**
   * replace the variables in str by values from obj
   * corresponding to keys
   * @param  {Object} obj    the json object
   * @param  {string} str    the string
   * @return {string}        the string with values
   */
  _prepareDisplay(obj, str = null) {
    var keys = this._getKeys(str)
    Array.prototype.forEach.call(keys, (key) => {
      var val = this._get(obj, key)
      var pattern = new RegExp('{{'+key+'}}|'+key, 'g')
      str = str.replace(pattern, val)
    })

    if (str == null) {
      str = obj
    }

    return str
  }

  /**
   * return array of variables {{variable}} extracted from str
   * @param  {string} str the string containing variables
   * @return {Array}     the array of variables
   */
  _getKeys(str){
    var regex = /\{\{(.*?)\}\}/g
    var variables = []
    var match

    while ((match = regex.exec(str)) !== null) {
      variables.push(match[1])
    }
    
    if (variables.length == 0 && str != null) {
      variables.push(str)
    }

    return variables
  }

  _hide() {
    if(this._visible) {
      this._visible = false
      this._shouldBeVisible = false
      if (this._divWrapper != null && this._divWrapper.parentNode) {
        this._divWrapper.parentNode.removeChild(this._divWrapper)
      }
    }
  }

  _show(target) {
    if(!this._visible) {
      this._visible = true
      this._divWrapper.style.marginTop = `${target.offsetHeight}px`
      this._divWrapper.style.width = `${target.offsetWidth}px`
      target.parentNode.insertBefore(this._divWrapper, target)
    }
  }

  _startAutocomplete(target) {
    var val = target.value.toLowerCase()
    if(val.length > 2) {
      if(this._previousValue === val) {
        this._show(target)
        return
      }else {
        this._previousValue = val
      }
      var dataVal = target.getAttribute('data-value').replace(/&quote;/g, '\'')

      if(dataVal.indexOf('{{') > -1){
        var match
        while (match = /\{\{(.*?)\}\}/.exec(dataVal)) {
          var selector = target.form.querySelector('[data-id="' + match[1] + '"]')
          if(selector != null) {
            dataVal = dataVal.replace('{{' + match[1] + '}}', selector.value)
          }
        }
      }

      if (dataVal.indexOf('http') === 0) {
        this._ajax(
          {
            url: `${dataVal}${val}`,
            body: '',
            cors: true,
            method: 'get'
          },
          (code, responseText) => {
            this._showAutocomplete(JSON.parse(responseText), target, val)
          })
      }else {
        var sources = JSON.parse(target.getAttribute('data-value').replace(/&quote;/g, '\''))
        this._showAutocomplete(sources, target, val)
      }
    }else {
      this._hide()
    }
  }

  _keyUp(e) {
    if(e.keyCode !== 13) {
      this._startAutocomplete(e.currentTarget)
    }
  }

  _refresh(e) {
    var target = e.currentTarget
    
    var autocompleteResultWrapper = target.parentNode.parentNode.querySelector('.autocomplete-result-wrapper')
    var autocompleteResult = autocompleteResultWrapper.querySelectorAll('.autocomplete-result')
    Array.prototype.forEach.call(autocompleteResult, (autocompleteResult) => {
      autocompleteResult.parentNode.removeChild(autocompleteResult)
    })

    var jsonPost = JSON.parse(JSON.stringify(json))
    delete jsonPost.abe_source
    this._currentInput = target.parentNode.parentNode.querySelector('input')
    var display = target.getAttribute('data-autocomplete-data-display')
    var body = qs.stringify({
      sourceString: target.getAttribute('data-autocomplete-refresh-sourcestring'),
      prefillQuantity: target.getAttribute('data-autocomplete-refresh-prefill-quantity'),
      key: target.getAttribute('data-autocomplete-refresh-key'),
      json: jsonPost
    })

    this._ajax(
      {
        url: '/abe/sql-request',
        body: body,
        cors: true,
        method: 'post'
      },
    (code, responseText) => {
      var items = JSON.parse(responseText)
      Array.prototype.forEach.call(items, function(item) {
        this._add(display, JSON.stringify(item), item, autocompleteResultWrapper)
      }.bind(this))
      this._saveData()
    })
  }

  _keyDown(e) {
    if(this._canSelect) {
      var parent = this._currentInput.parentNode.querySelector('.autocomplete-wrapper')
      if(typeof parent !== 'undefined' && parent !== null) {
        var current = this._currentInput.parentNode.querySelector('.autocomplete-wrapper .selected')
      
        var newSelected = null
        var selected = document.querySelector('.autocomplete-wrapper .selected')
        switch (e.keyCode) {
        case 9:
            // tab
          this._hide()
          break
        case 13:
            // enter
          e.preventDefault()
          if(typeof selected !== 'undefined' && selected !== null) {
            this._select(selected)
            this._hide()
          }
          break
        case 27:
            // escape
          e.preventDefault()
          this._hide()
          break
        case 40:
            // down
          e.preventDefault()
          if(typeof selected !== 'undefined' && selected !== null) {
            newSelected = selected.nextSibling
            this._show(e.currentTarget)
          }
          break
        case 38:
            // prev
          e.preventDefault()
          if(typeof selected !== 'undefined' && selected !== null) {
            newSelected = selected.previousSibling
          }
          break
        default:
          break
        }

        if(typeof newSelected !== 'undefined' && newSelected !== null) {
          var scrollTopMin = parent.scrollTop
          var scrollTopMax = parent.scrollTop + parent.offsetHeight - newSelected.offsetHeight
          var offsetTop = newSelected.offsetTop
          if (scrollTopMax < offsetTop) {
            parent.scrollTop = newSelected.offsetTop - parent.offsetHeight + newSelected.offsetHeight
          }else if (scrollTopMin > offsetTop) {
            parent.scrollTop = newSelected.offsetTop
          }
          current.classList.remove('selected')
          newSelected.classList.add('selected')
        }
      }
    }
  }

  _focus(e) {
    this._canSelect = true
    this._currentInput = e.currentTarget
    this._startAutocomplete(e.currentTarget)
  }

  _blur() {
    this._canSelect = false
    this._currentInput = null
    this._hide()
  }

  _remove(e) {
    var target = e.currentTarget.parentNode
    var escapedSelector = target.getAttribute('data-parent-id').replace(/(:|\.|\[|\])/g,'\\$1')
    this._currentInput = document.querySelector(`#${escapedSelector}`)
    target.parentNode.removeChild(target)
    this._saveData()
    this._currentInput = null
  }
}