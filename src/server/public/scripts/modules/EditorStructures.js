/*global document */

import Handlebars from 'handlebars'
import Nanoajax from 'nanoajax'
import qs from 'qs'

export default class EditorStructures {
  constructor() {
    this._ajax = Nanoajax.ajax
    this.datas = JSON.parse(document.querySelector('.structure-json').value)
    this.structureWrapper = document.querySelector('.structure-wrapper')
    this.folderName = document.querySelector('input.folder-name')

    var lvl_0 = this.createFolder('structure/', 0, '', 'main', '')

    this.createStructure(lvl_0, this.datas)
    this.structureWrapper.appendChild(lvl_0)
    this.rebind()
  }

  createFolder(path, level, daddy, folderName, hidden = 'hidden') {
    var folder = document.createElement('div')
    if(hidden && hidden !== '') folder.classList.add(hidden)
    folder.classList.add('structure-folder')
    folder.setAttribute('data-path', path.replace(/\/+$/, "") + '/')
    folder.setAttribute('data-level', level)
    folder.setAttribute('data-daddy', daddy)

    var span = document.createElement('span')
    span.innerHTML = `<span class="glyphicon glyphicon-chevron-right arrow" aria-hidden="true"></span>
                      ${folderName}
                      <div class="structure-tool">
                        <span class="glyphicon glyphicon-plus-sign folder-action" data-init="0" data-action="add" aria-hidden="true"></span>
                        <span class="glyphicon glyphicon-remove-circle folder-action" data-init="0" data-action="remove" aria-hidden="true"></span>
                      </div>
                      `
    folder.appendChild(span)

    this.bindArrow(span.querySelector('.arrow'))

    return folder
  }

  toggleFolder(daddy, forceState = ''){
    var folders = daddy.querySelectorAll('[data-level="' + (parseInt(daddy.getAttribute('data-level')) + 1) + '"]')
    if(folders) {
      if(!daddy.classList.contains('open') || forceState === 'open'){
        daddy.classList.add('open')
        Array.prototype.forEach.call(folders, (folder) => {
          folder.classList.remove('hidden')
        })
      }
      else{
        daddy.classList.remove('open')
        Array.prototype.forEach.call(folders, (folder) => {
          folder.classList.add('hidden')
        })
      }
    }
  }

  bindArrow(arrow) {
    arrow.addEventListener('click', (e) => {
      this.toggleFolder(arrow.parentNode.parentNode)
    })
  }

  createStructure(daddy, datas) {
    Array.prototype.forEach.call(datas, (data) => {
      var folderName = data['path'].split('/')
      var folder = this.createFolder(
        data['path'],
        (parseInt(daddy.getAttribute('data-level')) + 1),
        daddy.getAttribute('data-daddy'),
        folderName[folderName.length - 1]
      )
      daddy.appendChild(folder)

      if(data.folders && data.folders.length > 0) this.createStructure(folder, data.folders)
    })
  }

  add(element){
    this.toggleFolder(element, 'open')
    this.folderName.removeAttribute('disabled')
    this.folderName.focus()
    this.folderName.setAttribute('data-folder', `[data-path="${element.getAttribute('data-path')}"]`)

    var writeFolderName = (e) => {
      var value = this.folderName.value
      if(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(value)) this.folderName.classList.remove('error')
      else this.folderName.classList.add('error')
      if(e.keyCode === 13) {
        if(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(value)){
          this.folderName.removeEventListener('keyup', writeFolderName)
          this.folderName.setAttribute('disabled', 1)
          var newFolderDaddy = document.querySelector(this.folderName.getAttribute('data-folder'))
          var path = newFolderDaddy.getAttribute('data-path').split('/')
          path.pop()
          path = path.concat(value).join('/')
          var folder = this.createFolder(
            newFolderDaddy.getAttribute('data-path') + value,
            (parseInt(newFolderDaddy.getAttribute('data-level')) + 1),
            newFolderDaddy.getAttribute('data-daddy'),
            value,
            ''
          )
          newFolderDaddy.appendChild(folder)
          this.rebind()
          this.save(qs.stringify({type: 'add', folderPath: (newFolderDaddy.getAttribute('data-path') + value)}))
          this.folderName.value = ''
        }
      }
    }

    this.folderName.removeEventListener('keyup', writeFolderName)
    this.folderName.addEventListener('keyup', writeFolderName)
  }

  remove(element){
    this.save(qs.stringify({type: 'remove', folderPath: element.getAttribute('data-path')}))
    element.parentNode.removeChild(element)
  }

  save(body){
    this._ajax({url: '/abe/structure/', body: body, cors: true, method: 'post'}, () => {

    })
  }

  rebind(){
    var folderActions = document.querySelectorAll('.folder-action')
    Array.prototype.forEach.call(folderActions, (folderAction) => {
      if(parseInt(folderAction.getAttribute('data-init')) === 0){
        folderAction.setAttribute('data-init', 1)
        folderAction.addEventListener('click', (e) => {
          var target = e.target
          this[target.getAttribute('data-action')](target.parentNode.parentNode.parentNode)
        })
      }
    })  
  }

}
