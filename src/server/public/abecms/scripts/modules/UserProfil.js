/*global document, confirm, $ */

import Nanoajax from 'nanoajax'
import qs from 'qs'

var userProfil = {
  init: function () {
    var scope = document.querySelector('.user-profil')
    if (scope != null) {
      this._ajax = Nanoajax.ajax

      this._scope = scope
      this._form = this._scope.querySelector('form')
      this._info = this._scope.querySelector('[data-info-msg="true"]')
      this._handleSubmit = this._submit.bind(this)

      this._bindEvents()
    }
  },
  _bindEvents: function () {

    this._form.addEventListener('submit', this._handleSubmit)
    
  },
  _submit: function (e) {
    e.preventDefault()

    var inputs = this._form.querySelectorAll('input,select')
    var data = {}
    var isValid = true
    Array.prototype.forEach.call(inputs, (input) => {
      if (!input.disabled) {
        var name = input.getAttribute('name')
        var value = input.value
        var required = input.getAttribute('required')
        if (value == null && required == "true") {
          isValid = false
        }else if(value !== null && value !== "") {
          data[name] = value
        }
      }
    })

    var toSave = qs.stringify(data)
    
    if (isValid) {
      this._ajax(
        {
          url: this._form.getAttribute('action'),
          body: toSave,
          method: 'post'
        }, (code, responseText) => {
          var res = JSON.parse(responseText);
          if (res.success === 1) {
            this._info.classList.add('hidden')
          }else {
            this._info.classList.remove('hidden')
            this._info.innerHTML = res.message
          }
        })
    }

    return false
  }
}

export default userProfil