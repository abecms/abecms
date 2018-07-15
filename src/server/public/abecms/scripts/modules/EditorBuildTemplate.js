/*global document */

import Nanoajax from 'nanoajax'
import qs from 'qs'

export default class EditorBuildTemplate {
  constructor() {
    this._ajax = Nanoajax.ajax
    this.saveTemplate = document.querySelector('.save-template')
    this.saveTemplateName = document.querySelector('.save-template input[name="name"]')
    if (
      typeof this.saveTemplateName === 'undefined' ||
      this.saveTemplateName === null
    )
      return
    
      this.nameError = this.saveTemplate.querySelector('.error-display')
    this.rebind()
  }

  nameAlreadyExist(name) {
    var res = false
    // Array.prototype.forEach.call(this.templates, template => {
    //   if (template.getAttribute('data-href') == name) res = true
    // })
    return false //res
  }

  addError(val, fullTest = true) {
    var message = ''
    if (val.trim() === '') {
      message = 'filename is empty'
    } else if (!/^[A-Za-z0-9-\.]+(?:-[A-Za-z0-9-\.]+)*$/.test(val)) {
      message = 'filename must not contains special characteres'
    } else if (this.nameAlreadyExist(val)) {
      message = 'a template with this name already exist'
    }
    this.nameError.textContent = message
  }

  rebind() {
    this.saveTemplate.querySelector('button').addEventListener('click', () => {
      this.save()
    })
    this.saveTemplateName.addEventListener('keyup', () => {
      var val = this.saveTemplateName.value
      if (
        !/^[A-Za-z0-9-\.]+(?:-[A-Za-z0-9-\.]+)*$/.test(val) ||
        this.nameAlreadyExist(val)
      )
        this.saveTemplate.classList.add('error')
      else this.saveTemplate.classList.remove('error')
      this.addError(val, false)
    })
  }

  save() {
    var data = qs.stringify({
      name: this.saveTemplateName.value,
      partials: document.querySelector('.save-template input[name="partials"]').value
    })
    this._ajax(
      {
        url: '/abe/build-template/',
        body: data,
        cors: true,
        method: 'post'
      },
      () => {
        // this.textArea.classList.add('saved')
        // setTimeout(() => {
        //   this.textArea.classList.remove('saved')
        // }, 400)
      }
    )
  }
}
