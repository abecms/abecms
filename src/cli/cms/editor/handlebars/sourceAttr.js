
export default function sourceAttr(val, params) {
  var hiddenVal = val
  var selected = ''
  var display = params.display

  if (display.indexOf('{{') > -1) {
    display = display.replace('{{', '').replace('}}', '')
    if (display.indexOf('.') > -1) {
      display = display.split('.')
      display = display[display.length - 1]
    }
  }

  if(typeof hiddenVal === 'object' && Object.prototype.toString.call(hiddenVal) === '[object Object]') {
    hiddenVal = JSON.stringify(hiddenVal).replace(/'/g, '&apos;')

    try {
      var displayVal = eval('val.' + display)
      if(display != null&& displayVal != null) {
        val = displayVal
      }else {
        val = val[Object.keys(val)[0]]
      }
    }catch(e) {
      val = val[Object.keys(val)[0]]
    }
  }

  if(typeof params.value === 'object' && Object.prototype.toString.call(params.value) === '[object Array]') {
    Array.prototype.forEach.call(params.value, (v) => {
      var item = v
      try {
        var displayV = eval('item.' + display)
        if(display != null && displayV !== null) {
          item = displayV
        } else {
          if(typeof v === 'string') {
            item = v
          } else {
            item = v[Object.keys(v)[0]]
          }
        }
      } catch(e) {
        item = v[Object.keys(v)[0]]
      }
      
      if(typeof val === 'object' && Object.prototype.toString.call(val) === '[object Array]'
        && typeof item === 'object' && Object.prototype.toString.call(item) === '[object Array]') {
        
        Array.prototype.forEach.call(item, (i) => {
          if(val.indexOf(i) >= 0) {
            selected = 'selected="selected"'
          }
        })
      }else if(val === item) {
        selected = 'selected="selected"'
      }
    })
  }else if(params.value === hiddenVal) {
    selected = 'selected="selected"'
  }

  return {
    hiddenVal: hiddenVal,
    selected: selected,
    val: val
  }
}
