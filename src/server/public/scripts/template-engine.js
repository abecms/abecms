import {Devtool} from './devtool/Devtool'

import EditorInputs from './modules/EditorInputs'
import EditorBlock from './modules/EditorBlock'
import EditorUtils from './modules/EditorUtils'
import EditorFiles from './modules/EditorFiles'
import EditorSave from './modules/EditorSave'
import EditorJson from './modules/EditorJson'
import EditorManager from './modules/EditorManager'
import EditorAutocomplete from './modules/EditorAutocomplete'
import EditorReload from './modules/EditorReload'
import qs from 'qs'

var htmlTag = document.querySelector('html')
window.CONFIG = JSON.parse(htmlTag.getAttribute('data-config'))
window.json = JSON.parse(unescape(htmlTag.getAttribute('data-json').replace(/&quot;/g, '\"')))
window.Locales = JSON.parse(htmlTag.getAttribute('data-locales'))

class Engine {

  constructor() {
    this._blocks = new EditorBlock()
    this._inputs = new EditorInputs()
    this._files = new EditorFiles()
    this._save = new EditorSave()
    this._manager = new EditorManager()
    this._autocomplete = new EditorAutocomplete()
    this._dev = new Devtool()

    this.json = EditorJson.instance

    this._bindEvents()

    this.table = null
    $(document).ready(() => {
      this.table = $('#navigation-list').DataTable({
        "pageLength": 50,
        "autoWidth": false
      })
    })
  }

  loadIframe() {
    EditorReload.instance.reload()
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
  json: engine.json,
  inputs: engine._inputs,
  files: engine._files,
  blocks: engine._blocks,
  autocomplete: engine._autocomplete,
  editorReload: EditorReload
}

document.addEventListener("DOMContentLoaded", function(event) {
  if(document.querySelector('#page-template')) engine.loadIframe()
})