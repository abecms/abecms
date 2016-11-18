function replaceSourceAttr(variables, currentValue, valueToReplace) {
  Array.prototype.forEach.call(variables, (variable) => {
    var variableToUse = variable.value
    if (variableToUse != null && variableToUse.indexOf('.') > -1) {
      var checkMatch = variableToUse.split('.')
      var found = false
      while(!found) {
        try {
          var isFound = eval('currentValue.' + checkMatch[0])
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
        var replaceVal = eval('currentValue.' + variableToUse)
        valueToReplace = valueToReplace.replace(new RegExp(variable.replace, 'g'), replaceVal)
      }catch(e) {

      }
    }else {
      valueToReplace = currentValue
    }
  })

  return valueToReplace
}

function isSelected(currentValue, values) {
  var isEqual = false
  if(typeof currentValue === 'object' && Object.prototype.toString.call(currentValue) === '[object Object]') {
    Array.prototype.forEach.call(values, (value) => {
      var checkAllEqual = false
      Array.prototype.forEach.call(Object.keys(value), (key) => {
        if (currentValue[key] != null && currentValue[key] == value[key] && checkAllEqual == false) {
          checkAllEqual = true
        }
      })
      if (checkAllEqual) {
        isEqual = true
      }
    })
  }else {
    Array.prototype.forEach.call(values, (value) => {
      if (currentValue == value) {
        isEqual = true
      }
    })
  }

  return isEqual
}

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

  var obectToValue = display
  // var replaceValue = params.value
  var replaceValue = val
  if(typeof replaceValue === 'object' && Object.prototype.toString.call(replaceValue) === '[object Object]') {
    hiddenVal = JSON.stringify(hiddenVal).replace(/'/g, '&apos;')
    val = replaceSourceAttr(variables, replaceValue, obectToValue)

    if (isSelected(replaceValue, params.value)) {
      selected = 'selected="selected"'
    }
  }else if(typeof replaceValue === 'object' && Object.prototype.toString.call(replaceValue) === '[object Array]') {
    hiddenVal = JSON.stringify(hiddenVal).replace(/'/g, '&apos;')
    Array.prototype.forEach.call(replaceValue, (currentValue) => {
      obectToValue = replaceSourceAttr(variables, currentValue, obectToValue)
    })
    if (isSelected(replaceValue, params.value)) {
      selected = 'selected="selected"'
    }
    val = obectToValue
  }else {
    if (isSelected(replaceValue, params.value)) {
      selected = 'selected="selected"'
    }
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
