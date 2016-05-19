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

    this.btn = document.createElement('button')
    this.btn.className = 'btn btn-primary'
    this.btn.textContent = 'Add'

    this.wrapper.innerHTML = ''
    this.wrapper.appendChild(this.linkNode)
    this.wrapper.appendChild(this.btn)
    this.onLink = on(this)
  }

  bindEvt(){
    var sendEvent = (res) => {
      this.wrapper.removeEventListener('mousedown', clickWrapper)
      document.body.removeEventListener('mousedown', cancel)
      this.wrapper.querySelector('input').value = ''
      this.onLink._fire(res)
      this.popup.close()
    }
    var cancel = (e) => {
      var target = e.target
      if(!target.classList.contains('abe-popup') && !target.parentNode.classList.contains('abe-popup')) sendEvent(null)
    }
    var clickWrapper = (e) => {
      var link = this.wrapper.querySelector('input').value
      if(e.target.classList.contains('btn')){
        sendEvent(link)
      }
    }
    this.wrapper.addEventListener('mousedown', clickWrapper)
    document.body.addEventListener('mousedown', cancel)
  }

  show(el){
    var elBounds = el.getBoundingClientRect()
    this.popup.open(elBounds.left, (elBounds.top + elBounds.height + 5))
    this.bindEvt()
  }

}
