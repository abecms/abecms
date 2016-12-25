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
    this.columns = [
      { 
        'data': null,
        'defaultContent': '',
        'orderable': false
      },
      { 
        'data': 'abe_meta.link'
      },
      { 
        'data': 'abe_meta.template'
      },
      { 
        'data': null,
        'defaultContent': ''
      }
    ]

    Array.prototype.forEach.call(workflow, (flow) => {
      this.columns.push( 
        { 'data': null,
          'defaultContent': '',
          'orderable': false
        } 
      )
    })

    this.columns.push(
      { 
        'data': null,
        'defaultContent': '',
        'orderable': false
      }
    )

    $(document).ready(() => {
      this.table = $('#navigation-list').DataTable( {
        'pageLength': 50,
        'processing': true,
        'serverSide': true,
        'ajax': '/abe/paginate',
        'columns': this.columns,
        'order': [[ 3, 'desc' ]],
        'stateSave': true,
        'drawCallback': function(settings) {
          window.abe.manager.rebind()
        },
        stateSaveCallback: function(settings,data) {
          localStorage.setItem( 'DataTables_' + settings.sInstance, JSON.stringify(data) )
        },
        stateLoadCallback: function(settings) {
          return JSON.parse( localStorage.getItem( 'DataTables_' + settings.sInstance ) )
        },
        'createdRow': function (row, data, index) {
          var actions = '<div class="row icons-action">'
          if(data.publish != null) {
            actions += `<a href="/abe/operations/unpublish${data.abe_meta.link}"
                 title="Unpublish"
                 class="icon" data-unpublish="true" data-text="Are you sure you want to unpublish : ${data.abe_meta.link}"
                 title="unpublish">
                <span class="glyphicon glyphicon-eye-close"></span>
              </a>`
          }
  
          actions += `<a href="/abe/operations/delete/${data.abe_meta.status}${data.abe_meta.link}"
               title="Delete"
               class="icon"
               data-delete="true"
               data-text="Are you sure you want to delete : ${data.abe_meta.link}"
               title="remove">
              <span class="glyphicon glyphicon-trash"></span>
            </a></div>`
          
          var i = 4
          Array.prototype.forEach.call(workflow, (flow) => {
            var wkf = ''
            if(typeof data[flow] !== 'undefined' && flow === 'publish') {
              wkf = `<a href="/abe/editor${data[flow].html}" class="checkmark label-published" title="${data[flow].cleanDate}">&#10004;</a>`
            } 
            if(data.abe_meta.status == flow && flow !== 'publish') {  
              wkf = `<a href="/abe/editor${data[flow].html}" class="label label-default label-draft" title="${data[flow].cleanDate}">${flow}</a>`
            }
            $('td', row).eq(i).html(wkf)
            ++i
          })

          $('td', row).eq(0).html(index + 1)
          $('td', row).eq(1).html('<a href="/abe/editor'+data.abe_meta.link+'" class="file-path">'+data.abe_meta.link+'</a>')
          $('td', row).eq(3).html(moment(data.date).format('YYYY/MM/DD'))
          $('td', row).eq(i).html(actions)
        }
      })
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
      this.table.ajax.reload()
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
  manager: engine._manager,
  blocks: engine._blocks,
  autocomplete: engine._autocomplete,
  editorReload: EditorReload
}

document.addEventListener('DOMContentLoaded', function() {
  if(document.querySelector('#page-template')) engine.inject()
})