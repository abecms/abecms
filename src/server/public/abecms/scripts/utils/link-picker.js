/*global document */

import on from 'on'
import Popup from './popup'

export default class LinkPicker {
  constructor(wrapper) {
    this.popup = new Popup(wrapper)
    this.wrapper = wrapper
    this.link = ''
    this.linkNode = document.createElement('input')
    this.linkNode.type = 'text'
    this.linkNode.value = ''
    this.linkNode.placeholder = 'http://example.com'

    this.checkboxes = document.createElement('div')
    this.checkboxes.classList.add('coche')
    this.checkboxes.classList.add('keep-popup')

    this.noFollowLabel = document.createElement('label')
    this.noFollowLabel.textContent = 'no-follow'
    this.noFollowLabel.classList.add('keep-popup')
    this.noFollow = document.createElement('input')
    this.noFollow.type = 'checkbox'
    this.noFollow.name = 'no-follow-' + parseInt(Math.random() * 100)
    this.noFollow.classList.add('keep-popup')

    this.targetLabel = document.createElement('label')
    this.targetLabel.textContent = 'target blank'
    this.targetLabel.classList.add('keep-popup')
    this.target = document.createElement('input')
    this.target.type = 'checkbox'
    this.target.name = 'target-' + parseInt(Math.random() * 100)
    this.target.classList.add('keep-popup')

    this.noFollowLabel.appendChild(this.noFollow)
    this.targetLabel.appendChild(this.target)
    this.checkboxes.appendChild(this.noFollowLabel)
    this.checkboxes.appendChild(this.targetLabel)

    this.btn = document.createElement('button')
    this.btn.className = 'btn btn-primary'
    this.btn.textContent = 'Add'

    this.wrapper.innerHTML = ''
    this.wrapper.appendChild(this.linkNode)
    this.wrapper.appendChild(this.btn)
    this.wrapper.appendChild(this.checkboxes)
    this.onLink = on(this)
  }

  bindEvt() {
    var sendEvent = res => {
      this.wrapper.removeEventListener('mousedown', clickWrapper)
      document.body.removeEventListener('mousedown', cancel)
      this.wrapper.querySelector('input').value = ''
      this.noFollow.checked = false
      this.target.checked = false
      this.onLink._fire(res)
      this.popup.close()
    }
    var cancel = e => {
      var target = e.target
      if (
        !target.classList.contains('abe-popup') &&
        !target.parentNode.classList.contains('keep-popup') &&
        !target.parentNode.classList.contains('abe-popup')
      ) {
        sendEvent(null)
      }
    }
    var clickWrapper = e => {
      var link = this.wrapper.querySelector('input').value
      if (e.target.classList.contains('btn')) {
        sendEvent({
          link: link,
          target: this.target.checked,
          noFollow: this.noFollow.checked
        })
      }
    }
    this.wrapper.addEventListener('mousedown', clickWrapper)
    document.body.addEventListener('mousedown', cancel)
  }

  show(el) {
    var elBounds = el.getBoundingClientRect()
    this.popup.open(elBounds.left, elBounds.top + elBounds.height + 5)
    this.bindEvt()
  }
}
