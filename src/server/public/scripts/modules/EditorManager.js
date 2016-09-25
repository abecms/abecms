import Nanoajax from 'nanoajax'
import qs from 'qs'
import {Promise} from 'es6-promise'
import extend from 'extend'
import strUtils from '../utils/str-utils'
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
        this._btnRepublish = document.querySelector('[data-republish]')
        this._btnCloseManager = document.querySelector('.close-manager')
        this._btnManager = document.querySelector('.btn-manager')
        this._btnVisitSite = document.querySelectorAll('.btn-visit-site')
        this._btnDataFile = document.querySelector('[data-file="true"]')

        this._btnDeleteFile = [].slice.call(document.querySelectorAll('[data-delete="true"]'))
        this._btnUnpublishFile = [].slice.call(document.querySelectorAll('[data-unpublish="true"]'))

    // event handlers
        this._handleBtnRepublishClick = this._btnRepublishClick.bind(this)
        this._handleBtnCloseManagerClick = this._btnCloseManagerClick.bind(this)
        this._handleBtnManagerTabClick = this._btnManagerTabClick.bind(this)
        this._handleBtnManagerClick = this._btnManagerClick.bind(this)
        this._handleBtnSaveConfigClick = this._btnSaveConfigClick.bind(this)
        this._handleBtnVisitClick = this._btnVisitClick.bind(this)

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

        this._bindEvents()
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
      (code, responseText, request) => {
          this.remove._fire(target.parentNode.parentNode.parentNode)
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
      (code, responseText, request) => {
          var labels = target.parentNode.parentNode.parentNode.querySelectorAll('.label:not(.hidden)')
          var p = target.parentNode.parentNode.parentNode.querySelector('.label-published')
          Array.prototype.forEach.call(labels, (label) => {
              label.classList.add('hidden')
          })
          var draft = target.parentNode.parentNode.parentNode.querySelector('.label-draft')
        
          if(typeof draft !== 'undefined' && draft !== null) {
              draft.classList.remove('hidden')
          }

          if(typeof p !== 'undefined' && p !== null) p.remove()
          target.remove()
      })
    }

    _btnVisitClick(e){
        var target = e.target
        var dataPage = target.getAttribute('data-page')
        this._ajax({
            url: document.location.origin + target.getAttribute('data-href'),
            method: 'get'
        },
      (code, responseText, request) => {
          var res = JSON.parse(responseText)
          var routePath = (typeof dataPage !== 'undefined' && dataPage !== null) ? dataPage : ''
          res.port = res.port === 80 ? '' : ':' + res.port
          window.open(`${res.webroot.replace(/\/$/, '')}${res.port}/${routePath}`, '_blank')
      })
    }

    _bindEvents(e) {
        Array.prototype.forEach.call(this._managerTabs, (managerTab) => {
            managerTab.addEventListener('click', this._handleBtnManagerTabClick)
        })
        Array.prototype.forEach.call(this._btnSaveConfig, (btnSaveConfig) => {
            btnSaveConfig.addEventListener('click', this._handleBtnSaveConfigClick)
        })
        Array.prototype.forEach.call(this._btnVisitSite, (btnVisitSite) => {
            btnVisitSite.addEventListener('click', this._handleBtnVisitClick)
        })
        this._btnManager.addEventListener('click', this._handleBtnManagerClick)
    
        if(typeof this._btnRepublish !== 'undefined' && this._btnRepublish !== null) {
            this._btnRepublish.addEventListener('click', this._handleBtnRepublishClick)
        }

        if(typeof this._btnCloseManager !== 'undefined' && this._btnCloseManager !== null) {
            this._btnCloseManager.addEventListener('click', this._handleBtnCloseManagerClick)
        }

        Array.prototype.forEach.call(this._btnDeleteFile, (deleteFile) => {
            deleteFile.addEventListener('click', this._handleBtnDeleteClick)
        })

        Array.prototype.forEach.call(this._btnUnpublishFile, (unpublishFile) => {
            unpublishFile.addEventListener('click', this._handleBtnUnpublishClick)
        })
    }

    _btnRepublishClick(e) {
        e.preventDefault()
        this._btnRepublish.querySelector('[data-not-clicked]').className = 'hidden'
        this._btnRepublish.querySelector('[data-clicked]').className = ''
        this._ajax(
            {
                url: document.location.origin + '/abe/republish',
                method: 'get'
            },
        (code, responseText, request) => {
          
        })
    }

    _btnCloseManagerClick() {
        this._manager.classList.remove('visible')
    }

    _save(website, json, path) {
        var p = new Promise((resolve, reject) => {
            var toSave = qs.stringify({
                website: website,
                json: json
            })

            this._ajax(
                {
                    url: document.location.origin + path + '?' + toSave,
                    method: 'get'
                },
        (code, responseText, request) => {
          // this.data = JSON.parse(responseText).json

            resolve()
        })
        })

        return p
    }

    _dotStringToJson(str, value) {
        var keys = str.split('.')
        var value = value
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

    _btnManagerClick(e) {
        if(this._manager.classList.contains('visible')) {
            this._manager.classList.remove('visible')
        }else {
            this._manager.classList.add('visible')
        }
    }
}	