import on from 'on'
import Popup from './popup'

export default class SmileyPicker {

  constructor(wrapper) {
    this.popup = new Popup(wrapper)
    this.wrapper = wrapper
    this.smileys = [
      {desc: "grinning face with smiling eyes", icon: "😁"},
      {desc: "face with tears of joy", icon: "😂"},
      {desc: "smiling face with open mouth", icon: "😃"},
      {desc: "smiling face with open mouth and smiling eyes", icon: "😄"},
      {desc: "smiling face with open mouth and cold sweat", icon: "😅"},
      {desc: "smiling face with open mouth and tightly-closed eyes", icon: "😆"},
      {desc: "winking face", icon: "😉"},
      {desc: "smiling face with smiling eyes", icon: "😊"},
      {desc: "face savouring delicious food", icon: "😋"},
      {desc: "relieved face", icon: "😌"},
      {desc: "smiling face with heart-shaped eyes", icon: "😍"},
      {desc: "smirking face", icon: "😏"},
      {desc: "unamused face", icon: "😒"},
      {desc: "face with cold sweat", icon: "😓"},
      {desc: "pensive face", icon: "😔"},
      {desc: "confounded face", icon: "😖"},
      {desc: "face throwing a kiss", icon: "😘"},
      {desc: "kissing face with closed eyes", icon: "😚"},
      {desc: "face with stuck-out tongue and winking eye", icon: "😜"},
      {desc: "face with stuck-out tongue and tightly-closed eyes", icon: "😝"},
      {desc: "disappointed face", icon: "😞"},
      {desc: "angry face", icon: "😠"},
      {desc: "pouting face", icon: "😡"},
      {desc: "crying face", icon: "😢"},
      {desc: "persevering face", icon: "😣"},
      {desc: "face with look of triumph", icon: "😤"},
      {desc: "disappointed but relieved face", icon: "😥"},
      {desc: "fearful face", icon: "😨"},
      {desc: "weary face", icon: "😩"},
      {desc: "sleepy face", icon: "😪"},
      {desc: "tired face", icon: "😫"},
      {desc: "loudly crying face", icon: "😭"},
      {desc: "face with open mouth and cold sweat", icon: "😰"},
      {desc: "face screaming in fear", icon: "😱"},
      {desc: "astonished face", icon: "😲"},
      {desc: "flushed face", icon: "😳"},
      {desc: "dizzy face", icon: "😵"},
      {desc: "face with medical mask", icon: "😷"},
      {desc: "grinning cat face with smiling eyes", icon: "😸"},
      {desc: "cat face with tears of joy", icon: "😹"},
      {desc: "smiling cat face with open mouth", icon: "😺"},
      {desc: "smiling cat face with heart-shaped eyes", icon: "😻"},
      {desc: "cat face with wry smile", icon: "😼"},
      {desc: "kissing cat face with closed eyes", icon: "😽"},
      {desc: "pouting cat face", icon: "😾"},
      {desc: "crying cat face", icon: "😿"},
      {desc: "weary cat face", icon: "🙀"},
      {desc: "face with no good gesture", icon: "🙅"},
      {desc: "face with ok gesture", icon: "🙆"},
      {desc: "person bowing deeply", icon: "🙇"},
      {desc: "see-no-evil monkey", icon: "🙈"},
      {desc: "hear-no-evil monkey", icon: "🙉"},
      {desc: "speak-no-evil monkey", icon: "🙊"},
      {desc: "happy person raising one hand", icon: "🙋"},
      {desc: "person raising both hands in celebration", icon: "🙌"},
      {desc: "person frowning", icon: "🙍"},
      {desc: "person with pouting face", icon: "🙎"},
      {desc: "person with folded hands", icon: "🙏"}
    ]

    var countSmiley = 0;
    var smileyHTML = `<table cellpadding="0" cellspacing="0">
                        <tbody>
                          <tr>`

    this.smileys.forEach((smiley) => {
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
