
import FolderSelect from './FolderSelect'
import TemplateSelect from './TemplateSelect'

export default class FormCreate {
  constructor() {
  	// constantes variables
  	this._filePath = ''

  	// constantes variables DOM elements
  	this._form = document.querySelector('.form-create')
    this._templateName = this._form.querySelector('[data-type-template-abe]')
    this._tplName = this._form.querySelector('[name=tplName]')
		this._submitBtn = this._form.querySelector('button[type=submit]')
    this._inputs = [].slice.call(this._form.querySelectorAll('input[type=text]'))
    this._selects = [].slice.call(this._form.querySelectorAll('select[id*="level-"]'))

    // constantes methodes
    this._handlePathChange = this._pathChange.bind(this)
    this._handleCanCreate = this._canCreate.bind(this)
    this._handleSubmit = this._submit.bind(this)

    // init modules
    new FolderSelect()
    new TemplateSelect()

    this._bindEvents()
  }

  _bindEvents() {
    this._inputs.forEach((input) => { input.addEventListener('keyup', this._handleCanCreate) })
    this._inputs.forEach((input) => { input.addEventListener('blur', this._handleCanCreate) })
    this._selects.forEach((select) => { select.addEventListener('change', this._handlePathChange) })

    if(typeof this._templateName !== 'undefined' && this._templateName !== null) {
      this._templateName.addEventListener('submit', this._handleCanCreate)
    }
    if(typeof this._form !== 'undefined' && this._form !== null) {
      this._form.addEventListener('submit', this._handleSubmit)
    }
  }

  _pathChange(e) {
    this._setFilePath()
    this._canCreate()
  }

  _submit(e) {
  	this._setFilePath()
  }

  /**
   * check if select page create are not empty
   * @return {Boolean} true|false
   */
  _canCreate() {
    var isValid = true

    if(this._templateName.value === '') {
      isValid = false
    }

    if(this._tplName.value === '') {
      isValid = false
    }

    if(isValid) {
      this._submitBtn.removeAttribute('disabled')
    }else {
      this._submitBtn.setAttribute('disabled', 'disabled')
    }
  }

  _setFilePath() {
  	this._filePath = this._getFilePath()
    this._form.querySelector('[name="filePath"]').value = this._filePath
  }

  _getFilePath() {
    var path = ''
    , name = this._tplName.value

    this._selects.forEach((select) => {
      if(select.offsetWidth > 0 && select.offsetHeight > 0) {
        var value = select.querySelector('option:checked').getAttribute('clean-value')
        if(typeof value !== 'undefined' && value !== null && value !== '') {
          path += value + '/'
        }else if(typeof select.value !== 'undefined' && select.value !== null && select.value !== '') {
          path += select.value + '/'
        }
      }
    })

    path = path.slice(0, -1)
    path = path.split('/')
  	path = path.join('/') + '/' + name

    return path
  }
}