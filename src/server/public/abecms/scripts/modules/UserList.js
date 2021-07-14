/*global document, confirm, $ */

import Nanoajax from 'nanoajax'
import qs from 'qs'

var usersList = {
  init: function() {
    var scope = document.querySelector('.user-list')
    if (scope != null) {
      this._ajax = Nanoajax.ajax

      this._scope = scope
      this._table = this._scope.querySelector('#filtered-list tbody')
      this._alert = document.querySelector('.alert')
      this._handleActivate = this._activate.bind(this)
      this._handleDeactivate = this._deactivate.bind(this)
      this._handleRemove = this._remove.bind(this)
      this._handleEdit = this._edit.bind(this)
      this._handleUpdate = this._update.bind(this)
      this._handleCloseUpdate = this._closeUpdate.bind(this)
      this._handleAdd = this._add.bind(this)

      this._bindEvents()
    }

    if (document.querySelectorAll('#filtered-list').length > 0) {
      var orderables = document.querySelectorAll('#filtered-list thead th')
      var columns = []
      Array.prototype.forEach.call(orderables, orderable => {
        var order = orderable.getAttribute('data-orderable')
        if (order != null) {
          columns.push({orderable: order == 'true' ? true : false})
        } else {
          columns.push(null)
        }
      })
      this.table = $('#filtered-list').DataTable({
        paging: false,
        info: false,
        columns: columns
      })
    }

    if (document.querySelectorAll('#filtered-list-url').length > 0) {
      this._handleFormUserRoleSubmit = this._formUserRoleSubmit.bind(this)

      this._formUserRole = document.querySelector('[data-user-role]')
      this._formUserRoleSave = document.querySelector('[data-save-user-role]')

      if (
        typeof this._formUserRole !== 'undefined' &&
        this._formUserRole !== null
      ) {
        this._formUserRole.addEventListener(
          'submit',
          this._handleFormUserRoleSubmit
        )
      }
    }
  },
  _bindEvents: function() {
    this._activateBtn = this._scope.querySelectorAll('[data-activate]')
    this._deactivateBtn = this._scope.querySelectorAll('[data-deactivate]')
    this._removeBtn = this._scope.querySelectorAll('[data-remove]')
    this._editBtn = this._scope.querySelectorAll('[data-edit]')
    this._updateBtn = this._scope.querySelectorAll('[data-update]')
    this._addBtn = this._scope.querySelector('[data-add-user]')

    Array.prototype.forEach.call(this._activateBtn, btn => {
      btn.removeEventListener('click', this._handleActivate)
      btn.addEventListener('click', this._handleActivate)
    })

    Array.prototype.forEach.call(this._deactivateBtn, btn => {
      btn.removeEventListener('click', this._handleDeactivate)
      btn.addEventListener('click', this._handleDeactivate)
    })

    Array.prototype.forEach.call(this._removeBtn, btn => {
      btn.removeEventListener('click', this._handleRemove)
      btn.addEventListener('click', this._handleRemove)
    })

    Array.prototype.forEach.call(this._editBtn, btn => {
      btn.removeEventListener('click', this._handleEdit, true)
      btn.addEventListener('click', this._handleEdit, true)
    })

    Array.prototype.forEach.call(this._updateBtn, btn => {
      btn.removeEventListener('click', this._handleUpdate, true)
      btn.addEventListener('click', this._handleUpdate, true)
    })

    if (typeof this._addBtn !== 'undefined' && this._addBtn !== null) {
      this._addBtn.addEventListener('click', this._handleAdd)
    }
  },
  _formUserRoleSubmit: function(e) {
    e.preventDefault()

    var inputs = this._formUserRole.querySelectorAll('input[type=checkbox]')
    var data = {}
    Array.prototype.forEach.call(inputs, input => {
      if (!input.disabled) {
        var name = input.getAttribute('name')
        if (data[name] == null) {
          data[name] = []
        }
        if (input.checked) {
          data[name].push(input.getAttribute('value'))
        }
      }
    })

    var toSave = qs.stringify(data)

    this._ajax(
      {
        url: '/abe/list-url/save',
        body: toSave,
        method: 'post'
      },
      () => {}
    )
  },
  _activate: function(e) {
    var target = e.currentTarget
    var id = target.getAttribute('data-user-id')

    var toSave = qs.stringify({
      id: id
    })

    this._ajax(
      {
        url: '/abe/users/activate',
        body: toSave,
        method: 'post'
      },
      () => {
        var childGlyph = target.querySelector('.fa')
        childGlyph.classList.remove('fa-eye', 'text-info')
        childGlyph.classList.add('fa-eye-slash', 'text-danger')
        target.classList.remove('fa-eye-slash', 'text-danger')
        target.classList.add('fa-eye', 'text-info')
        target.removeEventListener('click', this._handleActivate)
        target.addEventListener('click', this._handleDeactivate)
      }
    )
  },
  _deactivate: function(e) {
    var target = e.currentTarget
    var id = target.getAttribute('data-user-id')

    var toSave = qs.stringify({
      id: id
    })

    this._ajax(
      {
        url: '/abe/users/deactivate',
        body: toSave,
        method: 'post'
      },
      () => {
        var childGlyph = target.querySelector('.fa')
        childGlyph.classList.remove('fa-eye-slash', 'text-danger')
        childGlyph.classList.add('fa-eye', 'text-info')
        target.classList.remove('fa-eye', 'text-info')
        target.classList.add('fa-eye-slash', 'text-danger')
        target.removeEventListener('click', this._handleDeactivate)
        target.addEventListener('click', this._handleActivate)
      }
    )
  },
  _edit: function(e) {
    var parent = e.currentTarget.parentNode.parentNode
    e.currentTarget.removeEventListener('click', this._handleEdit, true)

    parent.classList.add('editing')
    var closeUpdateBtn = parent.querySelector('[data-close-update]')
    closeUpdateBtn.removeEventListener('click', this._handleCloseUpdate)
    closeUpdateBtn.addEventListener('click', this._handleCloseUpdate)
  },
  _closeFormUpdate(target) {
    var parent = target.parentNode.parentNode.parentNode
    var edit = parent.querySelector('[data-edit]')
    parent.classList.remove('editing')
    edit.addEventListener('click', this._handleEdit, true)
    target.removeEventListener('click', this._handleCloseUpdate)
  },
  _closeUpdate: function(e) {
    this._closeFormUpdate(e.currentTarget)
  },
  _update: function(e) {
    var parent = e.currentTarget.parentNode.parentNode.parentNode
    var target = e.currentTarget
    var data = {
      id: target.getAttribute('data-user-id')
    }

    var inputs = parent.querySelectorAll('.form-control')
    var msg = ''
    var hasError = false
    Array.prototype.forEach.call(
      inputs,
      function(input) {
        data[input.name] = input.value

        if (input.name === 'email' && !this._validateEmail(input.value)) {
          hasError = true
          input.parentNode.classList.add('has-error')
          this._alert.classList.remove('hidden')
          msg += 'email is invalid<br />'
          return
        } else if (input.value.trim() === '') {
          hasError = true
          input.parentNode.classList.add('has-error')
          this._alert.classList.remove('hidden')
          msg += input.name + ' is invalid<br />'
          return
        } else {
          input.parentNode.classList.remove('has-error')
        }
      }.bind(this)
    )

    if (hasError) {
      this._alert.innerHTML = msg
      return
    } else {
      this._alert.classList.add('hidden')
      this._alert.innerHTML = ''
    }
    var toSave = qs.stringify(data)

    this._ajax(
      {
        url: '/abe/users/update',
        body: toSave,
        method: 'post'
      },
      (code, responseText) => {
        var response = JSON.parse(responseText)
        if (response.success === 1) {
          Array.prototype.forEach.call(inputs, function(input) {
            input.parentNode.parentNode.querySelector('.value').innerHTML =
              input.value
          })
          this._closeFormUpdate(target)
        } else {
          this._alert.classList.remove('hidden')
          this._alert.innerHTML = response.message
        }
      }
    )
  },
  _remove: function(e) {
    var confirmDelete = confirm(e.currentTarget.getAttribute('data-text'))
    if (!confirmDelete) return

    var target = e.currentTarget
    var id = target.getAttribute('data-user-id')
    var toSave = qs.stringify({
      id: id
    })

    this._ajax(
      {
        url: '/abe/users/remove',
        body: toSave,
        method: 'post'
      },
      () => {
        target.parentNode.parentNode.remove()
      }
    )
  },
  _validateEmail: function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  },
  _add: function() {
    this._alert.classList.add('hidden')
    var username = document.querySelector('[data-add-user-username]')
    if (
      typeof username.value === 'undefined' ||
      username.value === null ||
      username.value === ''
    ) {
      username.parentNode.classList.add('has-error')
      return
    }
    username.parentNode.classList.remove('has-error')

    var name = document.querySelector('[data-add-user-name]')
    if (
      typeof name.value === 'undefined' ||
      name.value === null ||
      name.value === ''
    ) {
      name.parentNode.classList.add('has-error')
      return
    }
    name.parentNode.classList.remove('has-error')

    var email = document.querySelector('[data-add-user-email]')
    if (
      typeof email.value === 'undefined' ||
      email.value === null ||
      email.value === ''
    ) {
      email.parentNode.classList.add('has-error')
      return
    }
    if (!this._validateEmail(email.value)) {
      email.parentNode.classList.add('has-error')
      this._alert.classList.remove('hidden')
      this._alert.innerHTML = 'email is invalid'
      return
    }
    email.parentNode.classList.remove('has-error')

    var password = document.querySelector('[data-add-user-password]')
    if (
      typeof password.value === 'undefined' ||
      password.value === null ||
      password.value === ''
    ) {
      password.parentNode.classList.add('has-error')
      return
    }

    password.parentNode.classList.remove('has-error')

    var role = document.querySelector('[data-add-user-role]')
    var toSave = qs.stringify({
      username: username.value,
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })

    this._ajax(
      {
        url: '/abe/users/add',
        body: toSave,
        method: 'post'
      },
      (code, responseText) => {
        var data = JSON.parse(responseText)
        if (data.success === 1) {
          var tr = document.createElement('tr')
          var oldTr = document.querySelector('[data-user-base]')
          if (typeof oldTr !== 'undefined' && oldTr !== null) {
            tr.innerHTML = oldTr.innerHTML

            var tdUsername = tr.querySelector('.td-username')
            tdUsername.querySelector('.value').innerHTML = data.user.username
            tdUsername.querySelector('input').value = data.user.username

            var tdName = tr.querySelector('.td-name')
            tdName.querySelector('.value').innerHTML = data.user.name
            tdName.querySelector('input').value = data.user.name

            var tdEmail = tr.querySelector('.td-email')
            tdEmail.querySelector('.value').innerHTML = data.user.email
            tdEmail.querySelector('input').value = data.user.email

            var tdRole = tr.querySelector('.td-role')
            tdRole.querySelector('.value').innerHTML = data.user.role.name
            var tdRoleOptions = tdRole.querySelectorAll('select option')
            Array.prototype.forEach.call(tdRoleOptions, function(option) {
              if (option.value === data.user.role.name) {
                option.selected = 'selected'
              }
            })

            var tdActive = tr.querySelector('.td-active')
            var glypEyeClose = tdActive.querySelector('.fa-eye-slash')
            glypEyeClose.addEventListener('click', this._handleActivate, true)
            glypEyeClose.setAttribute('data-user-id', data.user.id)

            var tdActions = tr.querySelector('.td-actions')
            var glypEdit = tdActions.querySelector('.fa-pencil')
            glypEdit.addEventListener('click', this._handleEdit, true)
            glypEdit.setAttribute('data-user-id', data.user.id)

            var glypOk = tdActions.querySelector('.fa-ok')
            glypOk.addEventListener('click', this._handleUpdate, true)
            glypOk.setAttribute('data-user-id', data.user.id)

            var glypCloseUpdate = tdActions.querySelector('.fa-remove')
            glypCloseUpdate.setAttribute('data-user-id', data.user.id)
            // glypCloseUpdate.addEventListener('click', this._handleCloseUpdate, true)

            var glypRemove = tdActions.querySelector('.fa-trash')
            glypRemove.setAttribute('data-user-id', data.user.id)
            glypRemove.addEventListener('click', this._handleRemove, true)
          }

          this._table.appendChild(tr)

          username.value = ''
          name.value = ''
          email.value = ''
          password.value = ''
        } else {
          this._alert.classList.remove('hidden')
          this._alert.innerHTML = data.message
        }
      }
    )
  }
}

export default usersList

// var userListEle = document.querySelector('.user-list');
// if(typeof userListEle !== 'undefined' && userListEle !== null) {
//   usersList.init(userListEle)
// }
