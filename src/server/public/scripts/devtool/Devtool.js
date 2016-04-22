export class Devtool {

  constructor() {
    this.body = $('body')
    this.form = $('.form-wrapper')
    this.form = $('.form-wrapper')
    this.ruler = $('.iframe-wrapper')
    this.initDevtool()
    this.updateBrowserSize()
  }

  // ABE devtool
  initDevtool(){
    this.ruler.on('mousedown', (e) => {
      this.body.addClass('resizing')
      this.body.on('mousemove', (e) => {
        var newWidth = (e.clientX / window.innerWidth * 100) + '%'
        this.form.width(newWidth)
        this.form.attr('data-width', newWidth)
        this.updateBrowserSize()
      })
      this.body.one('mouseup mouseleave', () => {
        this.body.off('mousemove')
        this.body.removeClass('resizing')
      })
    })
    $(window).on('resize', () => {
      this.updateBrowserSize()
      this.body.addClass('resizing')
      setTimeout(() => { this.body.removeClass('resizing') }, 1000)
    })

    $('.close-engine').on('click', (e) => {
      this.body.removeClass('engine-open')
      this.form.width(0)
    })
    $('.open-engine').on('click', (e) => {
      this.body.addClass('engine-open')
      this.form.width(this.form.attr('data-width'))
    })
  }

  updateBrowserSize(){
    var $iframe = $('.iframe-wrapper iframe')
    $('.browser-size').text($iframe.width() + 'px x ' + $iframe.height() + 'px')
  }
}
