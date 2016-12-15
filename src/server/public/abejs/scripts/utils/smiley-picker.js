import on from 'on'
import Popup from './popup'
import SmileyData from './smileys' // @Source: http://apps.timwhitlock.info/emoji/tables/unicode

export default class SmileyPicker {
  constructor(wrapper) {
    this.popup = new Popup(wrapper)
    this.wrapper = wrapper
    var smileyHTML = '<div class="smiley-title">Emoji</div>'
    for(var smileys in SmileyData){
      var countSmiley = 0
      smileyHTML += `<div class="smiley-subtitle">${smileys} :</div>
                    <table cellpadding="0" cellspacing="0">
                        <tbody>
                          <tr>`
      SmileyData[smileys].forEach((smiley) => {
        if(countSmiley > 9) {
          smileyHTML += '</tr><tr>'
          countSmiley = 0
        }
        smileyHTML += `<td class="wysiwyg-toolbar-smiley" data-smiley="${smiley.icon}">
                        <span class="" title="${smiley.desc}" data-smiley="${smiley.icon}">${smiley.icon}</span>
                       </td>`
        countSmiley++
      })
      smileyHTML +=     `</tr>
                      </tbody>
                    </table>`
    }
    this.wrapper.innerHTML = smileyHTML
    this.bindEvt()
  }

  bindEvt(){
    this.onSmiley = on(this)
    this.wrapper.addEventListener('click', (e) => {
      var target = e.target
      if(target.getAttribute('data-smiley') != null){
        this.onSmiley._fire(`&nbsp;${target.getAttribute('data-smiley')}&nbsp;`)
        this.popup.close()
      }
    })
  }

  show(el){
    var elBounds = el.getBoundingClientRect()
    this.popup.open(elBounds.left, (elBounds.top + elBounds.height + 5))
  }
}
