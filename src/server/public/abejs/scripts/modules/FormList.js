/*global document, $, top */

export default class FormList {
  constructor() {
    // bind button event click
    this._btnValidates = [].slice.call(document.querySelectorAll('[data-validate-content]'))
    this._handleBtnValidatesClick = this._btnValidatesClick.bind(this)

    this._btnValidates.forEach((input) => {
      input.addEventListener('click', this._handleBtnValidatesClick)
    })

    // bind button event click
    this._btnSetRevisions = [].slice.call(document.querySelectorAll('[data-revisions]'))

    this._btnSetRevisions.forEach((input) => {
      input.addEventListener('click', this._handleBtnValidatesClick)
    })
  }

  _btnValidatesClick(e) {
    var tplPath = e.currentTarget.getAttribute('data-template-path')
    var filePath = e.currentTarget.getAttribute('data-file-path')
    var type = e.currentTarget.getAttribute('data-type')

    var data = {
      tplPath: tplPath,
      filePath: filePath,
      saveAction: type
    }

    $.ajax({
      url: document.location.origin + '/save',
      data: data
    }).done(() => {
      top.location.href = top.location.href
    })
  }
}