import EditorUtils from '../modules/EditorUtils'
import Json from '../modules/EditorJson'
import Save from '../modules/EditorSave'
import {IframeNode, IframeCommentNode} from '../utils/iframe'
import Handlebars from 'handlebars'
import Nanoajax from 'nanoajax'
import qs from 'qs'
import on from 'on'

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

    this._autocompletesRemove = [].slice.call(document.querySelectorAll('[data-autocomplete-remove=true]'))
    this._autocompletes = [].slice.call(document.querySelectorAll('[data-autocomplete=true]'))

    this._currentInput = null
    this._divWrapper = document.createElement('div')
    this._divWrapper.classList.add('autocomplete-wrapper')

    this._visible = false

    this.rebind()
  }

  rebind() {
  	document.body.removeEventListener('mouseup', this._handleDocumentClick)
  	document.body.addEventListener('mouseup', this._handleDocumentClick)

  	Array.prototype.forEach.call(this._autocompletesRemove, (autocompleteRemove) => {
  		autocompleteRemove.addEventListener('click', this._handleRemove)
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
  }

  _saveData() {
    var id = this._currentInput.getAttribute('id')
    var nodeComments = IframeCommentNode('#page-template', id)
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

    if(typeof nodeComments !== 'undefined' && nodeComments !== null && nodeComments.length > 0) {
      var results = [].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result'))
      var json = this._json.data
    
      json[id] = []
      Array.prototype.forEach.call(results, (result) => {
        var value = result.getAttribute('value')
        if(value !== '') {
          if(value.indexOf('{') > -1 || value.indexOf('[') > -1) {
            json[id].push(JSON.parse(value))
          }else {
            json[id].push(value)
          }
        }
      })

      this._json.data = json

      try {
        Array.prototype.forEach.call(nodeComments, (nodeComment) => {
          var blockHtml = unescape(nodeComment.textContent.replace(/\[\[([\S\s]*?)\]\]/, '')).replace(/\[0\]-/g, '[0]-')

          // var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]-/g, '[0]-')
          var template = Handlebars.compile(blockHtml, {noEscape: true})
          var compiled = template(this._json.data)

          nodeComment.parentNode.innerHTML = compiled + `<!-- ${nodeComment.textContent} -->`
        })
      } catch(e) {
        console.log(e);
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

  _documentClick(e) {
  	if(this._visible && !this._canSelect) {
	  	if(typeof this._divWrapper.parentNode !== 'undefined' && this._divWrapper.parentNode !== null) {
	  		this._hide()
	  	}
  	}
  }

  _select(target) {
    var val = JSON.parse(target.getAttribute('data-value'))
    var maxLength = this._currentInput.getAttribute('data-maxlength')
    if(typeof maxLength !== 'undefined' && maxLength !== null && maxLength !== '') {
      maxLength = parseInt(maxLength)
      var countLength = [].slice.call(this._currentInput.parentNode.querySelectorAll('.autocomplete-result-wrapper .autocomplete-result')).length
      if(countLength+1 > maxLength) {
        return
      }
    }
    var display = target.getAttribute('data-display')
    var div = document.createElement('div')
    div.classList.add('autocomplete-result')
    div.setAttribute('data-parent-id', this._currentInput.getAttribute('data-id'))
    div.setAttribute('value', target.getAttribute('data-value'))
    div.innerHTML = `${this._deep_value_array(val, display)}`

    var resWrapper = this._divWrapper.parentNode.querySelector('.autocomplete-result-wrapper')

    var remove = document.createElement('span')
    remove.classList.add('glyphicon', 'glyphicon-remove')
    remove.setAttribute('data-autocomplete-remove', 'true')
    remove.addEventListener('click', this._handleRemove)
    div.appendChild(remove)

    resWrapper.appendChild(div)

    this._saveData()

  }

  _selectValue(e) {
    this._select(e.currentTarget)
  }

  _showAutocomplete(sources, target, val) {
    var display = target.getAttribute('data-display')
    var first = true

    this._divWrapper.innerHTML = ''
    if(typeof sources !== 'undefined' && sources !== null) {
      if(typeof sources === 'object' && Object.prototype.toString.call(sources) === '[object Object]') {
        sources = [sources]
      }
      Array.prototype.forEach.call(sources, (source) => {
        var sourceVal = this._deep_value_array(source, display)
        if(typeof sourceVal !== 'undefined' && sourceVal !== null) {
          sourceVal = sourceVal.toLowerCase()
          if(sourceVal.indexOf(val) > -1) {
            var div = document.createElement('div')
            div.addEventListener('mousedown', this._handleSelectValue)
            div.setAttribute('data-value', JSON.stringify(source))
            div.setAttribute('data-display', display)
            if(first) {
              div.classList.add('selected')
            }
            first = false
            div.innerHTML = sourceVal.replace(val, `<span class="select">${val}</span>`)
            this._divWrapper.appendChild(div)
          }
          
        }
      })
    }
    this._show(target)
  }

  _hide() {
    if(this._visible) {
      this._visible = false
      this._shouldBeVisible = false
      this._divWrapper.parentNode.removeChild(this._divWrapper)
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
    	var dataVal = target.getAttribute('data-value')

      if (dataVal.indexOf('http') === 0) {
        this._ajax(
          {
            url: `${dataVal}${val}`,
            body: '',
            cors: true,
            method: 'get'
          },
          (code, responseText, request) => {
            this._showAutocomplete(JSON.parse(responseText), target, val)
          })
      }else {
        var sources = JSON.parse(target.getAttribute('data-value'))
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
            break;
          case 13:
            // enter
            e.preventDefault()
            if(typeof selected !== 'undefined' && selected !== null) {
              this._select(selected)
              this._hide()
            }
            break;
          case 27:
            // escape
            e.preventDefault()
            this._hide()
            break;
          case 40:
            // down
            e.preventDefault()
            if(typeof selected !== 'undefined' && selected !== null) {
              newSelected = selected.nextSibling
              this._show(e.currentTarget)
            }
            break;
          case 38:
            // prev
            e.preventDefault()
            if(typeof selected !== 'undefined' && selected !== null) {
              newSelected = selected.previousSibling
            }
            break;
          default:
            break;
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

  _blur(e) {
    this._canSelect = false
    this._currentInput = null
    this._hide()
  }

  _remove(e) {
    var target = e.currentTarget.parentNode
    this._currentInput = document.querySelector(`#${target.getAttribute('data-parent-id')}`)
    target.parentNode.removeChild(target)
    this._saveData()
    this._currentInput = null
  }

  _deep_value_array(obj, path) {

    if(path.indexOf('.') === -1) {
      return (typeof obj[path] !== 'undefined' && obj[path] !== null) ? obj[path] : null
    }

    var pathSplit = path.split('.')
    var res = JSON.parse(JSON.stringify(obj))

    while(pathSplit.length > 0) {
      
      if(typeof res[pathSplit[0]] !== 'undefined' && res[pathSplit[0]] !== null) {
        if(typeof res[pathSplit[0]] === 'object' && Object.prototype.toString.call(res[pathSplit[0]]) === '[object Array]') {
          var resArray = []

          Array.prototype.forEach.call(res[pathSplit[0]], (item) => {
            resArray.push(this._deep_value_array(item, pathSplit.join('.').replace(`${pathSplit[0]}.`, '')))
          })
          res = resArray
          pathSplit.shift()
        }else {
          res = res[pathSplit[0]]
        }
      }else {
        return null
      }
      pathSplit.shift()
    }

    return res
  }

  _deep_value(obj, path) {

    if(path.indexOf('.') === -1) {
      return (typeof obj[path] !== 'undefined' && obj[path] !== null) ? obj[path] : null
    }

    var pathSplit = path.split('.')
    var res = JSON.parse(JSON.stringify(obj))
    for (var i = 0; i < pathSplit.length; i++) {
      if(typeof res[pathSplit[i]] !== 'undefined' && res[pathSplit[i]] !== null) {
        res = res[pathSplit[i]]
      }else {
        return null
      }
    }

    return res
  }
}