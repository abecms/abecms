
export default function sourceAttr(val, params) {
  var hiddenVal = val
  var selected = ''
  var display = params.display

  var variables = []
  var displayValues = params.display
  var match
  var isVariable = false
  while(match = /\{\{(.*?)\}\}/g.exec(displayValues)) {
    if (match != null && match[1] != null) {
      isVariable = true
      // var lastMatch = match[1]
      // if (lastMatch.indexOf('.') > -1) {
      //   var lastMatch = lastMatch.split('.')
      //   lastMatch = lastMatch[lastMatch.length - 1]
      // }
      variables.push({
        replace: match[0],
        value: match[1]
      })
      displayValues = displayValues.replace('{{' + match[1] + '}}', "")
    }
  }

  if (!isVariable) {
    variables.push({
      replace: displayValues,
      value: displayValues
    })
  }

  var val = display
  if(typeof params.value === 'object' && Object.prototype.toString.call(params.value) === '[object Array]') {
    Array.prototype.forEach.call(params.value, (v) => {
      Array.prototype.forEach.call(variables, (variable) => {
        var variableToUse = variable.value
        if (variableToUse.indexOf('.') > -1) {
          var checkMatch = variableToUse.split('.')
          var found = false
          while(!found) {
            try {
              var isFound = eval('v.' + checkMatch[0])
              if (isFound != null) {
                variableToUse = checkMatch.join('.')
                found = true
              }else {
                checkMatch.shift()
                if (checkMatch.length === 0) {
                  variableToUse = ""
                  found = true
                }
              }
            }catch(e) {
              checkMatch.shift()
              if (checkMatch.length === 0) {
                variableToUse = ""
                found = true
              }
            }
          }
        }

        if (variableToUse != null && variableToUse != "") {
          try {
            var replaceVal = eval('v.' + variableToUse)
            val = val.replace(new RegExp(variable.replace, 'g'), replaceVal)
          }catch(e) {

          }
        }
      })
    })
  }

  // if (variables.length === 0) {
  //   variables.push({
  //     replace: display,
  //     value: display
  //   })
  // }

  // if (display.indexOf('{{') > -1) {
  //   display = display.replace('{{', '').replace('}}', '')
  //   if (display.indexOf('.') > -1) {
  //     display = display.split('.')
  //     display = display[display.length - 1]
  //   }
  // }

  // if(typeof hiddenVal === 'object' && Object.prototype.toString.call(hiddenVal) === '[object Object]') {
  //   hiddenVal = JSON.stringify(hiddenVal).replace(/'/g, '&apos;')

  //   try {
  //     var displayVal = eval('val.' + display)
  //     if(display != null && displayVal != null) {
  //       val = displayVal
  //     }else {
  //       val = val[Object.keys(val)[0]]
  //     }
  //   }catch(e) {
  //     val = val[Object.keys(val)[0]]
  //   }
  // }

  // if(typeof params.value === 'object' && Object.prototype.toString.call(params.value) === '[object Array]') {
  //   Array.prototype.forEach.call(params.value, (v) => {
  //     var item = v
  //     try {
  //       var displayV = eval('item.' + display)
  //       if(display != null && displayV !== null) {
  //         item = displayV
  //       } else {
  //         if(typeof v === 'string') {
  //           item = v
  //         } else {
  //           item = v[Object.keys(v)[0]]
  //         }
  //       }
  //     } catch(e) {
  //       item = v[Object.keys(v)[0]]
  //     }
      
  //     if(typeof val === 'object' && Object.prototype.toString.call(val) === '[object Array]'
  //       && typeof item === 'object' && Object.prototype.toString.call(item) === '[object Array]') {
        
  //       Array.prototype.forEach.call(item, (i) => {
  //         if(val.indexOf(i) >= 0) {
  //           selected = 'selected="selected"'
  //         }
  //       })
  //     }else if(val === item) {
  //       selected = 'selected="selected"'
  //     }
  //   })
  // }else if(params.value === hiddenVal) {
  //   selected = 'selected="selected"'
  // }

  return {
    hiddenVal: hiddenVal,
    selected: selected,
    val: val
  }
}
