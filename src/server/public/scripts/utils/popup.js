export default class Popup {

  constructor(wrapper) {
    this.wrapper = wrapper
    this.wrapper.classList.add('abe-popup')
    document.addEventListener('click', (e) => {
      if(this.isOpen && !this.wrapper.contains(e.target)) this.close()
    })
  }

  open(x = 0, y = 0){
    setTimeout(() => {
      this.isOpen = true
    }, 500)
    this.wrapper.style.left = x + 'px'
    this.wrapper.style.top = y + 'px'
    if(!this.wrapper.classList.contains('on')) this.wrapper.classList.add('on')
  }

  close(){
    if(this.wrapper.classList.contains('on')) this.wrapper.classList.remove('on')
    this.isOpen = false
  }

}
