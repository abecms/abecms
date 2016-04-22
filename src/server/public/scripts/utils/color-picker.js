import on from 'on'
import Popup from './popup'

export default class ColorPicker {

  constructor(wrapper) {
    this.popup = new Popup(wrapper)
    this.wrapper = wrapper
    this.colors = [
      ['ffdfdf','ffe7df','ffefdf','fff7df','ffffdf','f7ffdf','efffdf','e7ffdf','dfffdf','dfffe7','dfffef','dffff7','dfffff','dff7ff','dfefff','dfe7ff','dfdfff','e7dfff','efdfff','f7dfff','ffdfff','ffdff7','ffdfef','ffdfe7','ffffff'],
      ['ffbfbf','ffcfbf','ffdfbf','ffefbf','ffffbf','efffbf','dfffbf','cfffbf','bfffbf','bfffcf','bfffdf','bfffef','bfffff','bfefff','bfdfff','bfcfff','bfbfff','cfbfff','dfbfff','efbfff','ffbfff','ffbfef','ffbfdf','ffbfcf','ebebeb'],
      ['ff9f9f','ffb79f','ffcf9f','ffe79f','ffff9f','e7ff9f','cfff9f','b7ff9f','9fff9f','9fffb7','9fffcf','9fffe7','9fffff','9fe7ff','9fcfff','9fb7ff','9f9fff','b79fff','cf9fff','e79fff','ff9fff','ff9fe7','ff9fcf','ff9fb7','d7d7d7'],
      ['ff7f7f','ff9f7f','ffbf7f','ffdf7f','ffff7f','dfff7f','bfff7f','9fff7f','7fff7f','7fff9f','7fffbf','7fffdf','7fffff','7fdfff','7fbfff','7f9fff','7f7fff','9f7fff','bf7fff','df7fff','ff7fff','ff7fdf','ff7fbf','ff7f9f','c4c4c4'],
      ['ff5f5f','ff875f','ffaf5f','ffd75f','ffff5f','d7ff5f','afff5f','87ff5f','5fff5f','5fff87','5fffaf','5fffd7','5fffff','5fd7ff','5fafff','5f87ff','5f5fff','875fff','af5fff','d75fff','ff5fff','ff5fd7','ff5faf','ff5f87','b0b0b0'],
      ['ff3f3f','ff6f3f','ff9f3f','ffcf3f','ffff3f','cfff3f','9fff3f','6fff3f','3fff3f','3fff6f','3fff9f','3fffcf','3fffff','3fcfff','3f9fff','3f6fff','3f3fff','6f3fff','9f3fff','cf3fff','ff3fff','ff3fcf','ff3f9f','ff3f6f','9c9c9c'],
      ['ff1f1f','ff571f','ff8f1f','ffc71f','ffff1f','c7ff1f','8fff1f','57ff1f','1fff1f','1fff57','1fff8f','1fffc7','1fffff','1fc7ff','1f8fff','1f57ff','1f1fff','571fff','8f1fff','c71fff','ff1fff','ff1fc7','ff1f8f','ff1f57','898989'],
      ['ff0000','ff3f00','ff7f00','ffbf00','ffff00','bfff00','7fff00','3fff00','00ff00','00ff3f','00ff7f','00ffbf','00ffff','00bfff','007fff','003fff','0000ff','3f00ff','7f00ff','bf00ff','ff00ff','ff00bf','ff007f','ff003f','757575'],
      ['df0000','df3700','df6f00','dfa700','dfdf00','a7df00','6fdf00','37df00','00df00','00df37','00df6f','00dfa7','00dfdf','00a7df','006fdf','0037df','0000df','3700df','6f00df','a700df','df00df','df00a7','df006f','df0037','626262'],
      ['bf0000','bf2f00','bf5f00','bf8f00','bfbf00','8fbf00','5fbf00','2fbf00','00bf00','00bf2f','00bf5f','00bf8f','00bfbf','008fbf','005fbf','002fbf','0000bf','2f00bf','5f00bf','8f00bf','bf00bf','bf008f','bf005f','bf002f','4e4e4e'],
      ['9f0000','9f2700','9f4f00','9f7700','9f9f00','779f00','4f9f00','279f00','009f00','009f27','009f4f','009f77','009f9f','00779f','004f9f','00279f','00009f','27009f','4f009f','77009f','9f009f','9f0077','9f004f','9f0027','3a3a3a'],
      ['7f0000','7f1f00','7f3f00','7f5f00','7f7f00','5f7f00','3f7f00','1f7f00','007f00','007f1f','007f3f','007f5f','007f7f','005f7f','003f7f','001f7f','00007f','1f007f','3f007f','5f007f','7f007f','7f005f','7f003f','7f001f','272727'],
      ['5f0000','5f1700','5f2f00','5f4700','5f5f00','475f00','2f5f00','175f00','005f00','005f17','005f2f','005f47','005f5f','00475f','002f5f','00175f','00005f','17005f','2f005f','47005f','5f005f','5f0047','5f002f','5f0017','131313'],
      ['3f0000','3f0f00','3f1f00','3f2f00','3f3f00','2f3f00','1f3f00','0f3f00','003f00','003f0f','003f1f','003f2f','003f3f','002f3f','001f3f','000f3f','00003f','0f003f','1f003f','2f003f','3f003f','3f002f','3f001f','3f000f','000000']
    ]

    var colorHTML = `<table cellpadding="0" cellspacing="0">
                      <tbody>`


    this.colors.forEach((color) => {
      colorHTML += `<tr>`
      color.forEach((color) => {
        colorHTML += `<td class="wysiwyg-toolbar-color" title="#${color}" style="background-color:#${color};"></td>`
      })
      colorHTML += `</tr>`
    })

    colorHTML +=     `</tbody>
                    </table>`

    this.wrapper.innerHTML = colorHTML
  	this.bindEvt()
  }

  bindEvt(){
    this.onColor = on(this)
    this.wrapper.addEventListener('click', (e) => {
      var target = e.target
      if(target.classList.contains('wysiwyg-toolbar-color')){
        this.onColor._fire(target.getAttribute('title'))
        this.popup.close()
      }
    })
  }

  show(el){
    var elBounds = el.getBoundingClientRect()
    this.popup.open(elBounds.left, (elBounds.top + elBounds.height + 5))
  }

}
