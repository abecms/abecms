import on from 'on'
import Popup from './popup'

// allow override from plugins
window.ImagePickerUpload = {
  getPopup: function () {
  
    return `<div class="form-group" >
              <div class="input-group img-upload">
                <div class="input-group-addon image">
                  <span class="glyphicon glyphicon-picture" aria-hidden="true"></span>
                </div>
                <input type="text" id="wysiwyg-image-text" name="wysiwyg-image-text" placeholder="image or video (.mp4)" value="" class="form-control form-abe file-input">
                <div class="upload-wrapper">
                  <input class="form-control" id="wysiwyg-image-upload" name="wysiwyg-image-upload" value="" type="file" title="upload an image">
                  <span class="percent">
                    <span class="glyphicon glyphicon-upload" aria-hidden="true"></span>
                  </span>
                </div>
                <div class="btn-add-img-wrapper">
                  <button class="btn-add-img btn btn-primary">add</button>
                </div>
              </div>
              <div class="input-error">
              </div>
            </div>`
  },
  init: function (callBack) {
    var wysiwygText = document.querySelector('#wysiwyg-image-text')
    var wysiwygUpload = document.querySelector('#wysiwyg-image-upload')
    var btnAddImg = document.querySelector('.btn-add-img')
    var uploadImage = function (e) {
      var target = e.target
      var formData = new FormData()
      if (target.value == '') {
        console.log('Please choose file!')
        return false
      }
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
        input.focus()
        input.blur()
        setTimeout(function () {
          percent.innerHTML = percentHtml
        }, 1000)
        wysiwygUpload.removeEventListener('change', uploadImage)
        btnAddImg.removeEventListener('click', addImg)
        callBack(resp.filePath)
      }
      percent.textContent = '0%'
      xhr.send(formData)
    }

    var addImg = function () {
      callBack(wysiwygText.value)
    }

    wysiwygUpload.addEventListener('change', uploadImage)
    btnAddImg.addEventListener('click', addImg)

    return this
  }
}


export default class ImagePicker {

  constructor(wrapper) {
    this.popup = new Popup(wrapper)
    this.wrapper = wrapper
    this.bindEvt()
  }

  bindEvt(){
    this.onImg = on(this)
  }

  show(el){
    this.wrapper.innerHTML = window.ImagePickerUpload.getPopup()
    var elBounds = el.getBoundingClientRect()
    this.popup.open(elBounds.left, (elBounds.top + elBounds.height + 5))

    window.ImagePickerUpload.init((value) => {
      this.onImg._fire({image: value})
      this.popup.close()
    })
  }
}
