import {
  cmsData
} from '../../'

export function getPercentOfRequiredTagsFilled(text, json) {
  var regAbe = /{{abe[\S\s].*?key=['|"]([\S\s].*?['|"| ]}})/g
  var matches = text.match(regAbe)
  var requiredValue = 0
  var complete = 0
  if(typeof matches !== 'undefined' && matches !== null){
    Array.prototype.forEach.call(matches, (match) => {
      if(typeof match !== 'undefined' && match !== null) {
        
        var keyAttr = cmsData.regex.getAttr(match, 'key')
        var requiredAttr = cmsData.regex.getAttr(match, 'required')
        if(requiredAttr === 'true') {
          requiredValue++

          var minAttr = cmsData.regex.getAttr(match, 'min-length')
          minAttr = (minAttr !== '') ? minAttr : 0

          if(typeof json[keyAttr] !== 'undefined' && json[keyAttr] !== null && json[keyAttr] !== '') {
            if(minAttr > 0) {
              if(json[keyAttr].length >= minAttr) {
                complete++
              }
            }else {
              complete++
            }
          }
        }
      }
    })
  }

  return Math.round((requiredValue > 0) ? complete * 100 / requiredValue : 100)
}