import Color from './color-picker'

export default class RichTexarea {

  constructor(wrapper, color) {
  	this.color = color
  	this.wrapper = wrapper
  	this.textarea = wrapper.querySelector('.form-rich')
  	this.btns = this.wrapper.querySelectorAll('.wysiwyg-toolbar-icon')
    this.textEditor = wysiwyg({
	    element: this.textarea,
	    onKeyDown: (key, character, shiftKey, altKey, ctrlKey, metaKey) => {},
	    onKeyPress: (key, character, shiftKey, altKey, ctrlKey, metaKey) => {},
	    onKeyUp: (key, character, shiftKey, altKey, ctrlKey, metaKey) => {
	    	this.setHTML()
      },
	    onSelection: (collapsed, rect, nodes, rightclick) => {},
	    onPlaceholder: (visible) => {},
	    onOpenpopup: () => {},
	    onClosepopup: () => {},
	    hijackContextmenu: false
		})

    this._action = this.action.bind(this)
    Array.prototype.forEach.call(this.btns, (btn) => {
      btn.addEventListener('click', this._action)
    })
  }

  setHTML(){
  	this.textarea.innerHTML = this.textEditor.getHTML()
  	var evt = document.createEvent("KeyboardEvent")
	  evt.initKeyboardEvent("keyup", true, true, window, 0, 0, 0, 0, 0, "e".charCodeAt(0)) 
	  var canceled = !this.textarea.dispatchEvent(evt)
  }

  action(e){
  	this.el = e.target
  	if(this.el.tagName.toLowerCase() === 'span') this.el = this.el.parentNode

  	this.action = this.el.getAttribute('data-action')
		this.popup = this.el.getAttribute('data-popup')
  	this.param = this.el.getAttribute('data-param')
		if(typeof this.popup !== 'undefined' && this.popup !== null){
			switch(this.popup){
				case 'color':
				console.log('this.color', this.color)
					var off = this.color.onColor((color) => {
				  	this.textEditor[this.action](color)
						this.setHTML()
						off()
					})
					this.color.show(this.el)
				break;
			}
		}
		else{
	  	this.textEditor[this.action](this.param)
			this.setHTML()
		}

  }

}
