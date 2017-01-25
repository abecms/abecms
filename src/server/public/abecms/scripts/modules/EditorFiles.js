/*global document, FormData, CONFIG, XMLHttpRequest */

import EditorUtils from '../modules/EditorUtils'
import {IframeNode} from '../utils/iframe'
import on from 'on'

export default class EditorFiles {
  constructor() {
    this._filePathEle = document.getElementById('file-path')
    this.onUpload = on(this)
    this._handleChangeFiles = this._changeFiles.bind(this)
    this.rebind()
  }

  rebind() {
    let files = [].slice.call(document.querySelectorAll(
      '.img-upload input[type="file"], .file-upload input[type="file"]')
    )

    Array.prototype.forEach.call(files, (file) => {
      file.removeEventListener('change', this._handleChangeFiles)
      file.addEventListener('change', this._handleChangeFiles)
    })
  }

  _changeFiles(e) {
    this._uploadFile(e.target)
  }

  _uploadFile(target){
    var formData = new FormData()
    if (target.value == '') {
      console.log('Please choose file!')
      return false
    }
    EditorUtils.scrollToInputElement(target)
    var parentTarget = target.parentNode.parentNode
    var percent = parentTarget.querySelector('.percent')
    var percentHtml = percent.innerHTML
    var file = target.files[0]
    var uploadError = parentTarget.nextElementSibling

    uploadError.classList.remove('show')
    uploadError.textContent = ''

    formData.append('uploadfile', file)
    var xhr = new XMLHttpRequest()
    xhr.open('post', '/abe/upload/?baseUrl=' + CONFIG.FILEPATH + '&input=' + target.outerHTML, true)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        var percentage = (e.loaded / e.total) * 100
        percent.textContent = percentage.toFixed(0) + '%'
      }
    }
    xhr.onerror = () => { console.log('An error occurred while submitting the form. Maybe your file is too big') }
    xhr.onload = () => {
      var resp = JSON.parse(xhr.responseText)
      if(resp.error){
        uploadError.textContent = resp.response
        uploadError.classList.add('show')
        percent.innerHTML = percentHtml
        return
      }
      var input = parentTarget.querySelector('input.file-input')
      input.value = resp.filePath
      if(resp.thumbs){
        var parent = input.parentNode
        var id = input.id
        Array.prototype.forEach.call(resp.thumbs, (thumb) => {
          var thumdID = `${id}_${thumb.size}`
          var inputThumbs = parent.querySelector(`[data-id="${thumdID}"]`)
          if(inputThumbs != null) inputThumbs.value = thumb.name
          else {
            var inputThumbs = document.createElement('input')
            inputThumbs.classList.add('form-control')
            inputThumbs.classList.add('form-abe')
            inputThumbs.classList.add('file-input')
            inputThumbs.id = thumdID
            inputThumbs.setAttribute('data-id', thumdID)
            inputThumbs.value = thumb.name
            inputThumbs.type = 'hidden'
          }
          parent.appendChild(inputThumbs)
        })
      }
      input.focus()
      input.blur()
      
      var nodes = IframeNode('#page-template', '[data-abe-' + input.id.replace(/\./g, '-') + ']')
      Array.prototype.forEach.call(nodes, (node) => {
        EditorUtils.formToHtml(node, input)
      })
      this.onUpload._fire(target)
      setTimeout(function () {
        percent.innerHTML = percentHtml
      }, 1000)
    }
    percent.textContent = '0%'
    xhr.send(formData)
  }
}