/*global document, top, $, location, confirm, alert */

import Nanoajax from 'nanoajax'
import qs from 'qs'
import {Promise} from 'bluebird'
import extend from 'extend'
import on from 'on'

export default class EditorManager {
  constructor() {
    this._ajax = Nanoajax.ajax

    this.remove = on(this)

    // wrapper files
    this._manager = document.querySelector('.manager-wrapper')
    this._managerTabs = document.querySelectorAll('[data-manager-show]')
    this._filesList = [].slice.call(document.querySelectorAll('.manager-files .list-group-item'))

    // manager config button
    this._btnSaveConfig = document.querySelectorAll('[data-save-config]')

    // button manager
    this._btnGeneratePosts = document.querySelector('[data-generate-posts]')
    this._btnCloseManager = document.querySelector('.close-manager')
    this._btnManager = document.querySelector('.btn-manager')
    this._btnDataFile = document.querySelector('[data-file="true"]')

    // event handlers
    this._handleBtnGeneratePostsClick = this._btnGeneratePostsClick.bind(this)
    this._handleBtnCloseManagerClick = this._btnCloseManagerClick.bind(this)
    this._handleBtnManagerTabClick = this._btnManagerTabClick.bind(this)
    this._handleBtnManagerClick = this._btnManagerClick.bind(this)
    this._handleBtnSaveConfigClick = this._btnSaveConfigClick.bind(this)

    this._handleBtnDeleteClick = this._btnDeleteClick.bind(this)
    this._handleBtnUnpublishClick = this._btnUnpublishClick.bind(this)

    if(typeof top.location.hash !== 'undefined' && top.location.hash !== null && top.location.hash !== '') {
      var currentTab = document.querySelector('[href="' + top.location.hash + '"]')
      if(typeof currentTab !== 'undefined' && currentTab !== null) {
        currentTab.click() // retrieve old selected tab
      }
    }

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
      return location.hash = $(e.target).attr('href').substr(1)
    })

    this.rebind()
  }

  rebind() {
    this._btnDeleteFile = [].slice.call(document.querySelectorAll('[data-delete="true"]'))
    this._btnUnpublishFile = [].slice.call(document.querySelectorAll('[data-unpublish="true"]'))
    
    Array.prototype.forEach.call(this._managerTabs, (managerTab) => {
      managerTab.removeEventListener('click', this._handleBtnManagerTabClick)
      managerTab.addEventListener('click', this._handleBtnManagerTabClick)
    })
    Array.prototype.forEach.call(this._btnSaveConfig, (btnSaveConfig) => {
      btnSaveConfig.removeEventListener('click', this._handleBtnSaveConfigClick)
      btnSaveConfig.addEventListener('click', this._handleBtnSaveConfigClick)
    })

    if (this._btnManager != null) {
      this._btnManager.removeEventListener('click', this._handleBtnManagerClick)
      this._btnManager.addEventListener('click', this._handleBtnManagerClick)
    }
    
    if(typeof this._btnGeneratePosts !== 'undefined' && this._btnGeneratePosts !== null) {
      this._btnGeneratePosts.removeEventListener('click', this._handleBtnGeneratePostsClick)
      this._btnGeneratePosts.addEventListener('click', this._handleBtnGeneratePostsClick)
    }

    if(typeof this._btnCloseManager !== 'undefined' && this._btnCloseManager !== null) {
      this._btnCloseManager.removeEventListener('click', this._handleBtnCloseManagerClick)
      this._btnCloseManager.addEventListener('click', this._handleBtnCloseManagerClick)
    }

    Array.prototype.forEach.call(this._btnDeleteFile, (deleteFile) => {
      deleteFile.removeEventListener('click', this._handleBtnDeleteClick)
      deleteFile.addEventListener('click', this._handleBtnDeleteClick)
    })

    Array.prototype.forEach.call(this._btnUnpublishFile, (unpublishFile) => {
      unpublishFile.removeEventListener('click', this._handleBtnUnpublishClick)
      unpublishFile.addEventListener('click', this._handleBtnUnpublishClick)
    })
  }

  _btnDeleteClick(e){
    e.preventDefault()
    var confirmDelete = confirm(e.currentTarget.getAttribute('data-text'))
    if (!confirmDelete) return
    let href = e.currentTarget.getAttribute('href')
    let target = e.currentTarget
    this._ajax({
      url: href,
      method: 'get'
    },
      (e, responseText) => {
        var response = JSON.parse(responseText)
        if (response.success !== 1) {
          alert(response.message)
        }else {
          this.remove._fire(target.parentNode.parentNode.parentNode)
        }
      })
  }

  _btnUnpublishClick(e){
    e.preventDefault()
    var confirmDelete = confirm(e.currentTarget.getAttribute('data-text'))
    if (!confirmDelete) return
    let href = e.currentTarget.getAttribute('href')
    let target = e.currentTarget
    this._ajax({
      url: href,
      method: 'get'
    },
      (e, responseText) => {
        var response = JSON.parse(responseText)
        if (response.success !== 1) {
          alert(response.message)
        }else {
          this.remove._fire(target.parentNode.parentNode.parentNode)
        }
      })
  }

  _btnGeneratePostsClick(e) {
    e.preventDefault()
    this._btnGeneratePosts.querySelector('[data-not-clicked]').className = 'hidden'
    this._btnGeneratePosts.querySelector('[data-clicked]').className = ''
    this._ajax(
      {
        url: document.location.origin + '/abe/generate-posts',
        method: 'get'
      },
        (e, responseText) => {
          var response = JSON.parse(responseText)
          if (response.success !== 1) {
            alert(response.msg)
          }
        })
  }

  _btnCloseManagerClick() {
    this._manager.classList.remove('visible')
  }

  _save(website, json, path) {
    var p = new Promise((resolve) => {
      var toSave = qs.stringify({
        website: website,
        json: json
      })

      this._ajax(
        {
          url: document.location.origin + path + '?' + toSave,
          method: 'get'
        },
        () => {

          resolve()
        })
    })

    return p
  }

  _dotStringToJson(str, value) {
    var keys = str.split('.')
    var objStrStart = ''
    var objStrEnd = ''
    Array.prototype.forEach.call(keys, (key) => {
      objStrStart += '{"'+key+'":'
      objStrEnd += '}'
    })
    return JSON.parse(objStrStart + '"' + value + '"' + objStrEnd)
  }

  _serializeForm(form) {
    var json = {}
    let inputs = [].slice.call(form.querySelectorAll('input[type=text]'))
    Array.prototype.forEach.call(inputs, (input) => {
      extend(true, json, this._dotStringToJson(input.getAttribute('data-json-key'), input.value))
    })

    return json
  }

  _btnSaveConfigClick(e) {
    e.preventDefault()
    let website = e.currentTarget.getAttribute('data-website')
    let route = e.currentTarget.getAttribute('data-route')
    let json = this._serializeForm(document.querySelector(`form#config-${website}`))
    this._save(website, json, route)
  }

  _hideManagerBlock() {
    Array.prototype.forEach.call(this._managerTabs, (managerTab) => {
      var classname = `.${managerTab.getAttribute('data-manager-show')}`
      var blockElement = document.querySelector(classname)
      if(typeof blockElement !== 'undefined' && blockElement !== null) blockElement.classList.remove('visible')
    })
  }

  _btnManagerTabClick(e) {
    e.preventDefault()
    var classname = e.currentTarget.getAttribute('data-manager-show')
    this._hideManagerBlock()
    var blockElement = document.querySelector(`.${classname}`)
    if(typeof blockElement !== 'undefined' && blockElement !== null) blockElement.classList.add('visible')
  }

  _btnManagerClick() {
    if(this._manager.classList.contains('visible')) {
      this._manager.classList.remove('visible')
    }else {
      this._manager.classList.add('visible')
    }
  }
}	