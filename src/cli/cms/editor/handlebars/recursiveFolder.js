import path from 'path'

export default function recursiveFolder(obj, index = 1, dataShow = '', links = null, visible = false) {
  var classHidden = ''
  if(index > 1 && !visible) {
    classHidden = 'hidden'
  }

  var id = `level-${index}`
  if(dataShow) {
    id += `-${dataShow}`
  }
  var parent = obj[0] ? obj[0].path.split('/')[0] : ''
  var res = `<div class="form-group level-${index} ${classHidden}" data-parent="${parent}" data-shown="${dataShow}">
    <label for="${id}" class="control-label">Level ${index}</label>
      <select data-precontrib="true" data-slug="true" data-slug-type="path" data-show-hide-sub-folder="true" id="${id}" class="form-control">
        <option data-level-hide="${index+1}"></option>`

  var sub = ''

  Array.prototype.forEach.call(obj, (o) => {
    let selected = ''
    let isVisible = false
    let name = path.basename(o.path)
    if(links != null && links[index - 1] != null) {
      if (links[index - 1] === name) {
        selected = 'selected="selected"'
        isVisible = true
      }
    }
    res += `<option ${selected} data-level-hide="${index+2}" data-level-show="${index+1}" data-show="${name.replace(/\.| |\#/g, '_')}">${name}</option>`

    if(o.folders != null && o.folders.length > 0) {
      sub += recursiveFolder(o.folders, index+1, name.replace(/\.| |\#/g, '_'), links, isVisible)
    }
  })

  res += `</select>
  </div>`

  res += sub

  return res
}
