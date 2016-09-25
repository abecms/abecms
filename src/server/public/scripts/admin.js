import Handlebars from 'handlebars'
import FormCreate from './modules/FormCreate'
import FormList from './modules/FormList'

class Admin {
    constructor() {
        this._page = document.querySelector('body').getAttribute('data-page')
        this._formCreate = document.querySelector('.form-create')

        this._bindEvents()
    }

  /**
   * _bindEvents for admin pages
   * @return {null}
   */
    _bindEvents() {
        if(typeof this._formCreate !== 'undefined' && this._formCreate !== null) {
            new FormCreate()

        }else if(this._page === 'list') {
            new FormList()
        }
    }
}

var admin = new Admin()