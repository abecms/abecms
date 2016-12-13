
export default class FolderSelect {
  constructor(form) {
    this._form = form
    // constante variable
    this._selectTemplate = this._form.querySelector('#selectTemplate')
    this._selectsWebsite = this._form.querySelector('#level-1')
    this._selectsCreate = [].slice.call(this._form.querySelectorAll('select[id*="level-"]'))

    // constante methode
    this._handleChangeSelectsCreate = this._changeSelectsCreate.bind(this)

    this._bindEvents()
  }

  _bindEvents() {
    this._selectsCreate.forEach((select) => {
      select.addEventListener('change', this._handleChangeSelectsCreate)
    })
  }

  /**
   * bind event for select page create
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _changeSelectsCreate(e) {
    let selectedOption = e.currentTarget.querySelector('option:checked')

    let dataShow = selectedOption.getAttribute('data-show')
        ,levelShow = selectedOption.getAttribute('data-level-show')
        ,levelHide = selectedOption.getAttribute('data-level-hide')

    if(typeof levelShow !== 'undefined' && levelShow !== null && levelShow !== '') {
      this._showSubLevels(levelShow, dataShow)
    }
    if(typeof levelHide !== 'undefined' && levelHide !== null && levelHide !== '') {
      this._hideSubLevels(levelHide)
    }
  }

  _hideSubLevels(i) {
    var levels = [].slice.call(this._form.querySelectorAll('.level-' + i))
    while(levels.length > 0){
      levels.forEach((level) => {
        var options = [].slice.call(level.querySelectorAll('option'))
        Array.prototype.forEach.call(options, (option) => {
          option.selected = null
          option.removeAttribute('selected')
        })
        level.classList.add('hidden')
      })
      levels = [].slice.call(this._form.querySelectorAll('.level-' + i++))
    }
  }

  _showSubLevels(i, dataShow) {
    var levels = [].slice.call(this._form.querySelectorAll('.level-' + i))
    levels.forEach((level) => {
      level.classList.add('hidden')
      
      var childs = [].slice.call(this._form.querySelectorAll(`[data-shown=${dataShow}]`))
      if(childs) {
        childs.forEach(function (child) {
          var options = [].slice.call(child.querySelectorAll('option'))
          Array.prototype.forEach.call(options, (option) => {
            option.selected = null
            option.removeAttribute('selected')
          })

          child.classList.remove('hidden')
        })
      }
    })
  }
}