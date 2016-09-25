export default class FolderSelect {
    constructor() {
    
    // constante variable
        this._selectTemplate = document.querySelector('#selectTemplate')
        this._selectsWebsite = document.querySelector('#level-1')
        this._selectsCreate = [].slice.call(document.querySelectorAll('select[id*="level-"]'))

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

        let website = this._selectsWebsite.querySelector('option:checked').value 

        let dataShow = selectedOption.getAttribute('data-show')
  			,levelShow = selectedOption.getAttribute('data-level-show')
        ,levelHide = selectedOption.getAttribute('data-level-hide')
  			,levels

        if(typeof levelShow !== 'undefined' && levelShow !== null && levelShow !== '') {
            this._showSubLevels(levelShow, dataShow)
        }
        if(typeof levelHide !== 'undefined' && levelHide !== null && levelHide !== '') {
            this._hideSubLevels(levelHide)
        }
    }

    _hideSubLevels(i) {
        var levels = [].slice.call(document.querySelectorAll('.level-' + i))
        while(levels.length > 0){
            levels.forEach((level) => {
                var options = [].slice.call(level.querySelectorAll('option'))
                Array.prototype.forEach.call(options, (option) => {
                    option.selected = null
                    option.removeAttribute('selected')
                })
                level.classList.add('hidden')
            })
            levels = [].slice.call(document.querySelectorAll('.level-' + i++))
        }
    }

    _showSubLevels(i, dataShow) {
        var levels = [].slice.call(document.querySelectorAll('.level-' + i))
        var level1selected = document.querySelector('.level-1 select').value
        levels.forEach((level) => {
            level.classList.add('hidden')
      
      // console.log([].slice.call(document.querySelectorAll(`[data-shown=${dataShow}][data-parent=${level1selected}]`)))
            var childs = [].slice.call(document.querySelectorAll(`[data-shown=${dataShow}][data-parent=${level1selected}]`))
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