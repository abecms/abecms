export default class Popup {

  constructor(wrapper) {
    this.wrapper = wrapper
    this.wrapper.classList.add('abe-popup')
  }

  open(x = 0, y = 0){
    this.wrapper.style.left = x + 'px'
    this.wrapper.style.top = y + 'px'
    if(!this.wrapper.classList.contains('on')) this.wrapper.classList.add('on')
  }

  close(){
    if(this.wrapper.classList.contains('on')) this.wrapper.classList.remove('on')
  }

}
