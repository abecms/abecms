/*global document */

import Handlebars from 'handlebars'
import Nanoajax from 'nanoajax'
import qs from 'qs'

export default class EditorFiles {
  constructor() {
    this._ajax = Nanoajax.ajax
    this.referenceTabButton = document.querySelector('[data-manager-show="references-files"]')
    this.referenceTabButton.addEventListener('click', () => {
      this._ajax({
        url: '/abe/reference/',
        body: '',
        cors: true,
        method: 'get'
      }, (code, responseText) => {
        var resp = JSON.parse(responseText)
        var referenceListHtml = document.querySelector('.references-files-wrapper')
        var template = Handlebars.compile(referenceListHtml.innerHTML)
        var compiled = template(resp)
        referenceListHtml.innerHTML = compiled
        this.referenceLinks = document.querySelectorAll('[data-ref-json]')
        this.textArea = document.querySelector('.display-json')
        this.jsonError = document.querySelector('.json-error')
        if(!this.referenceLinks) return
        Array.prototype.forEach.call(this.referenceLinks, (referenceLink) => {
          var dataHref = referenceLink.getAttribute('data-href').split('/')
          referenceLink.textContent = dataHref[dataHref.length - 1]
        })
        this.rebind()
      })
    })
  }

  rebind() {
    Array.prototype.forEach.call(this.referenceLinks, (referenceLink) => {
      referenceLink.addEventListener('click', (e) => {
        e.preventDefault()
        this.textArea.style.opacity = 1
        Array.prototype.forEach.call(this.referenceLinks, (referenceLink) => {
          this.textArea.classList.remove('error')
          this.jsonError.style.opacity = 0
          referenceLink.classList.remove('active')
        })
        e.target.classList.add('active')
        if(parseInt(e.target.getAttribute('data-error')) === 1) {
          this.textArea.classList.add('error')
          this.jsonError.style.opacity = 1
        }
        this.displayReference(e.target)
      })
    })
    this.textArea.addEventListener('blur', () => {
      this.save()
    })
  }

  save(){
    var selectedElement = document.querySelector('.references-files-wrapper .list-group-item.active')
    var isValidJson = true
    this.textArea.classList.remove('error')
    this.jsonError.style.opacity = 0
    try{
      (typeof JSON.parse(this.textArea.value)) // validate json
      var data = qs.stringify({json: this.textArea.value, url: this.textArea.getAttribute('data-file')})
      selectedElement.setAttribute('data-ref-json', this.textArea.value)
      selectedElement.setAttribute('data-error', 0)
    }
    catch(e){
      this.jsonError.textContent = e
      isValidJson = false
      selectedElement.setAttribute('data-error', 1)
    }
    if(isValidJson){
      this._ajax({
        url: '/abe/reference/',
        body: data,
        cors: true,
        method: 'post'
      },
      () => {
        this.textArea.classList.add('saved')
        setTimeout(() => {
          this.textArea.classList.remove('saved')
        }, 400)
      })
    }
    else {
      this.textArea.classList.add('error')
      this.jsonError.style.opacity = 1
    }
  }

  displayReference(element) {
    this.textArea.value = JSON.stringify(JSON.parse(element.getAttribute('data-ref-json')), null, '\t')
    this.textArea.setAttribute('data-file', element.getAttribute('data-href'))
  }
}