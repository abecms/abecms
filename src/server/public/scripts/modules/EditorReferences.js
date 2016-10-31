/*global document, FormData, CONFIG, XMLHttpRequest */

import Nanoajax from 'nanoajax'
import qs from 'qs'

export default class EditorFiles {
  constructor() {
    this._ajax = Nanoajax.ajax
    this.referenceLinks = document.querySelectorAll('[data-ref-json]')
    this.textArea = document.querySelector('.display-json')
    this.jsonError = document.querySelector('.json-error')
    this.referenceTabButton = document.querySelector('[data-manager-show="references-files"]')
    if(this.referenceLinks) this.rebind()

      this._ajax(
      {
        url: `/abe/reference/`,
        body: '',
        cors: true,
        method: 'get'
      },
      (code, responseText) => {
        console.log(responseText)
      })
  }

  rebind() {
    Array.prototype.forEach.call(this.referenceLinks, (referenceLink) => {
      referenceLink.addEventListener('click', (e) => {
        e.preventDefault()
        this.textArea.style.opacity = 1;
        Array.prototype.forEach.call(this.referenceLinks, (referenceLink) => {
          this.textArea.classList.remove('error')
          this.jsonError.style.opacity = 0
          referenceLink.classList.remove('active')
        });
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
      this._ajax(
      {
        url: `/abe/reference/`,
        body: data,
        cors: true,
        method: 'post'
      },
      (code, responseText) => {
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