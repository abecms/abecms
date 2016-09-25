export default class FolderSelect {
  constructor() {
    
    this._bindEvents()
  }

  _bindEvents() {
		// bind select change event
    this._formCreate = document.querySelector('.form-create')
    
    this._select = document.querySelector('[data-type-template-abe]')
    if(typeof this._select !== 'undefined' && this._select !== null) {
      this._handleChangeSelects = this._changeSelects.bind(this)
      this._select.addEventListener('change', this._handleChangeSelects) 
    }
  }

  /**
   * bind event for select page create
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  _changeSelects(e) {
    var templateName = this._select.value.replace(/\.[^/.]+$/, '')
    console.log('_changeSelects', templateName)
    this._formCreate.setAttribute('action', CONFIG.URL + templateName)
  }
}