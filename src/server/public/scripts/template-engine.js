/*global document, window, $, Event */

import {Devtool} from './devtool/Devtool'

import EditorInputs from './modules/EditorInputs'
import EditorBlock from './modules/EditorBlock'
import EditorFiles from './modules/EditorFiles'
import EditorSave from './modules/EditorSave'
import EditorJson from './modules/EditorJson'
import EditorManager from './modules/EditorManager'
import EditorAutocomplete from './modules/EditorAutocomplete'
import EditorReload from './modules/EditorReload'
import EditorReferences from './modules/EditorReferences'
import EditorStructures from './modules/EditorStructures'

var htmlTag = document.querySelector('html')
window.CONFIG = JSON.parse(htmlTag.getAttribute('data-config'))
// window.json = JSON.parse(unescape(htmlTag.getAttribute('data-json').replace(/&quot;/g, '\"')))
var j = htmlTag.getAttribute('data-json')
if (j != null) {
  j = j.replace(/&quot;/g, '"')
  j = unescape(j)
  j = j.replace(/\%27/g, '\'')
  window.json = JSON.parse(j)
}else {
  window.json = {}
}
var l = htmlTag.getAttribute('data-locales')
if (l != null) {
  
  window.Locales = JSON.parse(l)
}else {
  window.Locales = {}
}
var s = htmlTag.getAttribute('data-slugs')
if (s != null) {
  window.slugs = JSON.parse(s)
}else {
  window.slugs = {}
}

class Engine {

  constructor() {
    this._blocks = new EditorBlock()
    this._inputs = new EditorInputs()
    this._files = new EditorFiles()
    this._save = new EditorSave()
    this._manager = new EditorManager()
    this._autocomplete = new EditorAutocomplete()
    this._dev = new Devtool()
    this.reference = new EditorReferences()
    this.structure = new EditorStructures()

    this.json = EditorJson.instance

    this._bindEvents()

    this.table = null
    $(document).ready(() => {
      if ($('#navigation-list').size() > 0) {
        this.table = $('#navigation-list').DataTable({
          //"order": [[ 3, 'desc' ]],
          'pageLength': 50,
          'autoWidth': false
        })
      }
    })

    var abeReady = new Event('abeReady')
    document.dispatchEvent(abeReady)
  }

  inject() {
    var findComments = function(el) { 
      var arr = [] 
      for(var i = 0; i < el.childNodes.length; i++) { 
        var node = el.childNodes[i] 
        if(node.nodeType === 8) { 
          arr.push(node) 
        } else { 
          arr.push.apply(arr, findComments(node)) 
        } 
      } 
      return arr 
    } 
 
    var commentNodes = findComments(document) 
  
    Array.prototype.forEach.call(commentNodes, (comment) => { 
      if (comment.nodeValue.indexOf('[pageHTML]') > -1) { 
        var base = comment.data 
        if(typeof base !== 'undefined' && base !== null) { 
          base = base.replace(/\[pageHTML\]/g, '') 
          base = base.replace(/<ABE!--/g, '<!--').replace(/--ABE>/g, '-->') 
          EditorReload.instance.inject(base) 
        } 
      } 
    })
  }

  _bindEvents() {

    this._blocks.onNewBlock(() => {
      this._files.rebind()
      this._inputs.rebind()
    })

    this._manager.remove((el) => {
      this.table.row($(el)).remove().draw()
    })

    this._inputs.onReload(() => {
      this._save.serializeForm()
      EditorReload.instance.reload()
    })

    this._autocomplete.onReload(() => {
      EditorReload.instance.reload()
    })

    this._inputs.onBlur(() => {
      this._save.serializeForm()
    })

    this._blocks.onRemoveBlock(() => {
      this._inputs.rebind()
      this._save.serializeForm() ///**************************************** HOOLA
    })
  }
}

var engine = new Engine()
window.abe = {
  save: engine._save,
  json: engine.json,
  inputs: engine._inputs,
  files: engine._files,
  blocks: engine._blocks,
  autocomplete: engine._autocomplete,
  editorReload: EditorReload
}

document.addEventListener('DOMContentLoaded', function() {
  if(document.querySelector('#page-template')) engine.inject()
})