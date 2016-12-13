/*global document */

import FormCreate from './modules/FormCreate'
import FormList from './modules/FormList'

class Admin {
  constructor() {
    this._page = document.querySelector('body').getAttribute('data-page')
    // this._formCreate = document.querySelector('.form-create')
    var forms = document.querySelectorAll('[data-form-abe-create]')
    Array.prototype.forEach.call(forms, function(form) {
      new FormCreate(form)      
    })

    this._bindEvents()
  }

  /**
   * _bindEvents for admin pages
   * @return {null}
   */
  _bindEvents() {
    if(typeof this._formCreate !== 'undefined' && this._formCreate !== null) {

    }else if(this._page === 'list') {
      new FormList()
    }
  }
}

new Admin()