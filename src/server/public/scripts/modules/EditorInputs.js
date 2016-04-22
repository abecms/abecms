import EditorUtils from '../modules/EditorUtils'
import Json from '../modules/EditorJson'
import Save from '../modules/EditorSave'
import {IframeNode, IframeCommentNode} from '../utils/iframe'
import Handlebars from 'handlebars'
import RichText from '../utils/rich-texarea'
import Color from '../utils/color-picker'
import Nanoajax from 'nanoajax'
import qs from 'qs'
import on from 'on'

export default class EditorInputs {
  constructor() {
    this._ajax = Nanoajax.ajax
    this._json = Json.instance
    this.color = new Color(document.querySelector('.wysiwyg-popup'))
    this.onBlur = on(this)
    this.onReload = on(this)
    this.onDisableInput = on(this)

    this._inputElements()
  }

  rebind() {
    this._reloads = [].slice.call(document.querySelectorAll('[reload=true]'))
    this._inputs = [].slice.call(document.querySelectorAll('input.form-abe'))
    this._inputs = this._inputs.concat([].slice.call(document.querySelectorAll('textarea.form-abe')))

    Array.prototype.forEach.call(this._reloads, (reload) => {
      reload.removeEventListener('blur', this._handleReloadBlur)
      reload.addEventListener('blur', this._handleReloadBlur)
    })

    Array.prototype.forEach.call(this._inputs, (input) => {
      input.removeEventListener('focus', this._handleInputFocus)
      input.addEventListener('focus', this._handleInputFocus)
    })

    this._selects = [].slice.call(document.querySelectorAll('#abeForm select'))
    Array.prototype.forEach.call(this._selects, (select) => {
      select.removeEventListener('change', this._handleChangeSelect)
      select.addEventListener('change', this._handleChangeSelect)
    })
  }

  /**
   * Manage input element to update template page
   * @return {void}
   */
  _inputElements(){
    this._handleReloadBlur = this._inputReloadBlur.bind(this)
    this._handleInputFocus = this._inputFocus.bind(this)
    this._handleInputBlur = this._inputBlur.bind(this)
    this._handleInputKeyup = this._inputKeyup.bind(this)
    this._handleChangeSelect = this._changeSelect.bind(this)

    var richs = document.querySelectorAll('.rich')
    if(typeof richs !== 'undefined' && richs !== null){
      Array.prototype.forEach.call(richs, (rich) => {
        new RichText(rich, this.color)
      })
    }

    this.rebind()
  }

  _hideIfEmpty(node, value) {
    var hide = IframeNode('#page-template', '[data-if-empty-clear="' + node.getAttribute('data-abe-') + '"]')[0]

    if(typeof hide !== 'undefined' && hide !== null) {
      if(value === '') {
        hide.style.display = 'none'
      }else {
        hide.style.display = ''
      }
    }
  }

  /**
   * [_inputBlur description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _inputBlur(e) {
    e.target.removeEventListener('keyup', this._handleInputFocus)
    e.target.removeEventListener('blur', this._handleInputFocus)

    var nodes = EditorUtils.getNode(EditorUtils.getAttr(e.target))
    Array.prototype.forEach.call(nodes, (node) => {
      this._hideIfEmpty(node, e.target.value)
      EditorUtils.formToHtml(node, e.target)
      node.classList.remove('select-border')
      node.classList.remove('display-attr')
    })

    this.onBlur._fire()
  }

  /**
   * [_inputKeyup description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _inputKeyup(e) {
    var nodes = EditorUtils.getNode(EditorUtils.getAttr(e.target))
    Array.prototype.forEach.call(nodes, (node) => {
      this._hideIfEmpty(node, e.target.value)
      EditorUtils.formToHtml(node, e.target)
    })
  }

  /**
   * [_inputFocus description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _inputReloadBlur(e) {
    if (e.currentTarget.getAttribute('data-autocomplete') !== 'true') {
      this.onReload._fire()
    }
  }

  /**
   * [_inputFocus description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _inputFocus(e) {
    EditorUtils.checkAttribute()
    EditorUtils.scrollToInputElement(e.target)
    
    // switch to set appropriate output {text|link|image|...}
    // listen to user input on ABE from
    e.target.addEventListener('keyup', this._handleInputKeyup)
    e.target.addEventListener('blur', this._handleInputBlur)
  }

  /**
   * [_changeSelect description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _changeSelect(e) {
    var target = e.currentTarget
    var maxLength = parseInt(target.getAttribute('data-maxlength'))
    var options = [].slice.call(target.querySelectorAll('option'))
    var optionsChecked = target.querySelectorAll('option:checked')
    var count = optionsChecked.length
    var attr = EditorUtils.getAttr(target)

    if(typeof maxLength !== 'undefined' && maxLength !== null && maxLength !== '') {
      if(count > maxLength) {
        var lastValues = JSON.parse(target.getAttribute('last-values'))

        Array.prototype.forEach.call(optionsChecked, function(optionChecked) {
          var unselect = true
          Array.prototype.forEach.call(lastValues, function(lastValue) {
            if(optionChecked.value.indexOf('{') > -1 || optionChecked.value.indexOf('[') > -1) {
              if(JSON.stringify(JSON.parse(optionChecked.value)) == JSON.stringify(lastValue)) {
                unselect = false
              }
            }else {
              if(optionChecked.value == lastValue) {
                unselect = false
              }
            }
          })

          if(unselect) {
            optionChecked.removeAttribute('selected')
            optionChecked.selected = false
            optionChecked.disabled = true
          }
        })
      }else {
        var lastValues = '['
        Array.prototype.forEach.call(optionsChecked, function(optionChecked) {
          if(optionChecked.value !== '') {
            if(optionChecked.value.indexOf('{') > -1 || optionChecked.value.indexOf('[') > -1) {
              lastValues += JSON.stringify(JSON.parse(optionChecked.value))
            }else {
              lastValues += `"${optionChecked.value}"`
            }
          }
          lastValues += ','
        })
        lastValues = lastValues.substring(0, lastValues.length - 1)
        lastValues += ']'
        target.setAttribute('last-values', lastValues)
      }
    }

    // var blockContent = IframeNode('#page-template', '.select-' + attr.id)[0]

    var nodeComments = IframeCommentNode('#page-template', attr.id)

    if(typeof nodeComments !== 'undefined' && nodeComments !== null && nodeComments.length > 0) {
      var checked = e.target.querySelectorAll('option:checked')
      var json = this._json.data
    
      json[attr.id] = []
      Array.prototype.forEach.call(checked, (check) => {
        if(check.value !== '') {
          if(check.value.indexOf('{') > -1 || check.value.indexOf('[') > -1) {
            json[attr.id].push(JSON.parse(check.value))
          }else {
            json[attr.id].push(check.value)
          }
        }
      })

      this._json.data = json
      
      Array.prototype.forEach.call(nodeComments, (nodeComment) => {
        var blockHtml = unescape(nodeComment.textContent.replace(/\[\[([\S\s]*?)\]\]/, '')).replace(/\[0\]-/g, '[0]-')

        // var blockHtml = unescape(blockContent.innerHTML).replace(/\[0\]-/g, '[0]-')
        var template = Handlebars.compile(blockHtml, {noEscape: true})
        var compiled = template(this._json.data)

        nodeComment.parentNode.innerHTML = compiled + `<!-- ${nodeComment.textContent} -->`
      })
    }else if(typeof attr.id !== 'undefined' && attr.id !== null) {
      var nodes = EditorUtils.getNode(attr)
      Array.prototype.forEach.call(nodes, (node) => {
        EditorUtils.formToHtml(node, target)
      })
    }

    Array.prototype.forEach.call(options, function(option) {
      option.disabled = false
    })
  }
}