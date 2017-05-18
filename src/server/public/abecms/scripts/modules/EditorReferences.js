/*global document */

import Nanoajax from 'nanoajax'
import qs from 'qs'

export default class EditorReferences {
  constructor() {
    this._ajax = Nanoajax.ajax
    this.referenceLinks = document.querySelectorAll('[data-ref-json]')
    this.textArea = document.querySelector('.display-json')
    this.jsonError = document.querySelector('.json-error')
    this.addReference = document.querySelector('.btn-add-reference')
    this.addReferenceInput = document.querySelector('.btn-add-reference input')
    this.nameError = this.addReference.querySelector('.error-display')
    this.rebind()
  }

  bindReference(referenceLink){
    referenceLink.setAttribute('data-init', 1)
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
  }

  nameAlreadyExist(name){
    var res = false
    Array.prototype.forEach.call(this.referenceLinks, (referenceLink) => {
      if(referenceLink.getAttribute('data-href') == name) res = true
    })
    return res
  }

  addError(val, fullTest = true){
    var message = ''
    if(val.trim() === '') {
      message = 'filename is empty'
    }
    else if(!(/^[A-Za-z0-9-\.]+(?:-[A-Za-z0-9-\.]+)*$/.test(val))) {
      message = 'filename must not contains special characteres'
    }
    else if(val.indexOf('.json') < 0 && fullTest) {
      message = 'missing .json extension'
    }
    else if(this.nameAlreadyExist(val)) {
      message = 'json reference with this name already exist'
    }
    this.nameError.textContent = message
  }

  rebind() {
    Array.prototype.forEach.call(this.referenceLinks, (referenceLink) => {
      if(parseInt(referenceLink.getAttribute('data-init')) !== 0) return
      this.bindReference(referenceLink)
    })
    this.textArea.addEventListener('blur', () => {
      this.save()
    })
    this.addReference.querySelector('span').addEventListener('click', () => {
      this.add()
    })
    this.addReferenceInput.addEventListener('keyup', () => {
      var val = this.addReferenceInput.value
      if(!(/^[A-Za-z0-9-\.]+(?:-[A-Za-z0-9-\.]+)*$/.test(val)) || this.nameAlreadyExist(val)) this.addReference.classList.add('error')
      else this.addReference.classList.remove('error')
      this.addError(val, false)
    })
  }

  add(){
    var val = this.addReferenceInput.value
    if(val.trim() !== '' && /^[A-Za-z0-9-\.]+(?:-[A-Za-z0-9-\.]+)*$/.test(val) && val.indexOf('.json') > -1 && !this.nameAlreadyExist(val)){
      this.addReference.classList.remove('error')
      var li = document.createElement('li')
      li.classList.add('list-group-item')
      li.setAttribute('data-error', '0')
      li.setAttribute('data-href', val)
      li.setAttribute('data-ref-json', '[]')
      li.textContent = val
      this.addReference.parentNode.insertBefore(li, this.addReference)
      this.referenceLinks = document.querySelectorAll('[data-ref-json]')
      this.bindReference(li)
    }
    else this.addReference.classList.remove('error')
    this.addError(val)
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