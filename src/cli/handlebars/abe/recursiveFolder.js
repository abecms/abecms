export default function recursiveFolder(obj, index = 1, dataShow = "", links = null, visible = false) {
  var classHidden = ""
  if(index > 1 && !visible) {
    classHidden = "hidden"
  }

  var id = `level-${index}`
  if(typeof dataShow !== "undefined" && dataShow !== null && dataShow !== "") {
    id += `-${dataShow}`
  }
  var parent = obj[0] ? obj[0].cleanPath.split("/")[0] : ""
  var res = `<div class="form-group level-${index} ${classHidden}" data-parent="${parent}" data-shown="${dataShow}">
    <label for="${id}" class="col-sm-5 control-label">Level ${index}</label>
    <div class="col-sm-7">
      <select data-show-hide-sub-folder="true" id="${id}" class="form-control">
        <option data-level-hide="${index+1}"></option>`

  var sub = ""

  Array.prototype.forEach.call(obj, (o) => {
    var selected = ""
    var isVisible = false
    if(typeof links !== "undefined" && links !== null &&
      typeof links[index - 1] !== "undefined" && links[index - 1] !== null) {
      if (links[index - 1] === o.name) {
        selected = "selected=\"selected\""
        isVisible = true
      }
    }
    res += `<option ${selected} data-level-hide="${index+2}" data-level-show="${index+1}" data-show="${o.name.replace(/\.| |\#/g, "_")}">${o.name}</option>`

    if(typeof o.folders !== "undefined" && o.folders !== null && o.folders.length > 0) {
      sub += recursiveFolder(o.folders, index+1, o.name.replace(/\.| |\#/g, "_"), links, isVisible)
    }
  })

  res += `</select>
    </div>
  </div>`

  res += sub

  return res
}
