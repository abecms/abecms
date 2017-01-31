/*global document, $, window */

export class Devtool {

  constructor() {
    this.body = $('body')
    this.form = $('.abeform-wrapper.form-wrapper')
    this.ruler = $('.iframe-wrapper')
    this.initDevtool()
    this.updateBrowserSize()
  }

  getCookie(cname) {
    var name = cname + '='
    var ca = document.cookie.split(';')
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i]
      while (c.charAt(0)==' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length,c.length)
      }
    }
    return ''
  }

  setCookie(cname, cvalue, exdays) {
    var d = new Date()
    d.setTime(d.getTime() + (exdays*24*60*60*1000))
    var expires = 'expires='+ d.toUTCString()
    document.cookie = cname + '=' + cvalue + '; ' + expires
  }

  // ABE devtool
  initDevtool(){
    var baseWidth = this.getCookie('editorWidth')
    if(typeof baseWidth !== 'undefined' && baseWidth !== null && baseWidth !== '') {
      this.form.width(baseWidth)
      this.form.attr('data-width', baseWidth)
      this.updateBrowserSize()
    }
    this.ruler.on('mousedown', () => {
      this.body.addClass('resizing')
      var newWidth
      this.body.on('mousemove', (e) => {
        newWidth = (e.clientX / window.innerWidth * 100) + '%'
        this.form.width(newWidth)
        this.form.attr('data-width', newWidth)
        this.updateBrowserSize()
      })
      this.body.one('mouseup mouseleave', () => {
        this.body.off('mousemove')
        this.body.removeClass('resizing')
        this.setCookie('editorWidth', newWidth, 365)
      })
    })
    $(window).on('resize', () => {
      this.updateBrowserSize()
      this.body.addClass('resizing')
      setTimeout(() => { this.body.removeClass('resizing') }, 1000)
    })

    $('.close-engine').on('click', () => {
      this.body.removeClass('engine-open')
      this.form.width(0)
    })
    $('.open-engine').on('click', () => {
      this.body.addClass('engine-open')
      this.form.width(this.form.attr('data-width'))
    })
  }

  updateBrowserSize(){
    var $iframe = $('.iframe-wrapper iframe')
    $('.browser-size').text($iframe.width() + 'px x ' + $iframe.height() + 'px')
  }
}
