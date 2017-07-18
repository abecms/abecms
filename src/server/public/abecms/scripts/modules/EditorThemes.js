/*global document */

import Nanoajax from 'nanoajax'
import qs from 'qs'

const regexUrl = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i

export default class EditorReferences {
  constructor() {
    this.inputTheme = document.querySelector('.upload-theme')
    this.btnTheme = document.querySelector('.btn-upload-theme')
    this.btnDeleteTheme = document.querySelector('.delete-theme')
    this.error = document.querySelector('.error')
    if (this.inputTheme != null) {
      this._ajax = Nanoajax.ajax
      this.rebind()
    }
  }

  validate(val) {
    var res = 'OK'
    if (val.trim().length === 0) res = 'empty field'
    else if (!regexUrl.test(val)) res = 'invalid url format'
    return res
  }

  addError(message) {
    this.error.classList.remove('hidden')
    this.error.textContent = message
  }

  removeError(message) {
    this.error.classList.add('hidden')
    this.error.textContent = ''
  }

  rebind() {
    this.btnTheme.addEventListener('click', () => {
      if (this.btnTheme.classList.contains('active')) return
      var val = this.inputTheme.value
      var message = this.validate(val)
      if (message === 'OK') this.upload(val)
      else this.addError(message)
    })
    this.btnDeleteTheme.addEventListener('click', () => {
      this._ajax(
        {
          url: '/abe/themes/',
          body: qs.stringify({delete: 1}),
          cors: true,
          method: 'post'
        },
        (e, responseText) => {
          document.querySelector('.current-theme').classList.add('hidden')
        }
      )
    })
  }

  upload(val) {
    this.btnTheme.classList.add('active')
    this.removeError()
    this._ajax(
      {
        url: '/abe/themes/',
        body: qs.stringify({zipUrl: val}),
        cors: true,
        method: 'post'
      },
      (e, responseText) => {
        var res = JSON.parse(responseText)
        if (res.success != null) this.success(res.theme)
        if (res.error != null)
          this.addError(
            'error: something went wrong while uploading your theme'
          )
        this.btnTheme.classList.remove('active')
      }
    )
  }

  success(infos) {
    var image = document.querySelector('.image-theme img')
    var theme = document.querySelector('.name-theme')
    var author = document.querySelector('.name-author a')
    image.src = infos.thumb != null ? infos.thumb : ''
    theme.textContent = infos.name != null ? infos.name : ''
    author.textContent = infos.author != null ? infos.author : ''
    author.href = infos.author_website != null ? infos.author_website : ''
    document.querySelector('.current-theme').classList.remove('hidden')
  }
}
