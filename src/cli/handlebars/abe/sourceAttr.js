
import {Sql} from "../../"

export default function sourceAttr(val, params) {
  var hiddenVal = val
  var selected = ""

  if(typeof hiddenVal === "object" && Object.prototype.toString.call(hiddenVal) === "[object Object]") {
    hiddenVal = JSON.stringify(hiddenVal).replace(/'/g, "&apos;")

    try {
      var displayVal = eval("val." + params.display)
      if(typeof params.display !== "undefined" && params.display !== null
        && typeof displayVal !== "undefined" && displayVal !== null) {
        val = displayVal
      }else {
        val = val[Object.keys(val)[0]]
      }
    }catch(e) {
      val = val[Object.keys(val)[0]]
    }
  }

  if(typeof params.value === "object" && Object.prototype.toString.call(params.value) === "[object Array]") {
    Array.prototype.forEach.call(params.value, (v) => {
      var item = v
      try {
        var displayV = eval("item." + params.display)
        if(typeof params.display !== "undefined" && params.display !== null
          && typeof displayV !== "undefined" && displayV !== null) {
          item = displayV
        }else {
          if(typeof v === "string") {
            item = v
          }else {
            item = v[Object.keys(v)[0]]
          }
        }
      }catch(e) {
        item = v[Object.keys(v)[0]]
      }
      
      if(typeof val === "object" && Object.prototype.toString.call(val) === "[object Array]"
        && typeof item === "object" && Object.prototype.toString.call(item) === "[object Array]") {
        
        Array.prototype.forEach.call(item, (i) => {
          if(val.includes(i)) {
            selected = "selected=\"selected\""
          }
        })
      }else if(val === item) {
        selected = "selected=\"selected\""
      }
    })
  }else if(params.value === hiddenVal) {
    selected = "selected=\"selected\""
  }

  return {
    hiddenVal: hiddenVal,
    selected: selected,
    val: val
  }
}
