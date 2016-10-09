import {
  Hooks
} from '../../'

/**
* Get All attributes from a Abe tag
* @return {Object} parsed attributes
*/
export function getAll(str, json) {
  str = Hooks.instance.trigger('beforeAbeAttributes', str, json)

  //This regex analyzes all attributes of a Abe tag 
  var re = /\b([a-z][a-z0-9\-]*)\s*=\s*("([^"]+)"|'([^']+)'|(\S+))/ig
  
  var attrs = {
    autocomplete: null,
    desc: '',
    display: null,
    editable: true,
    key: '',
    'max-length': null,
    'min-length': 0,
    order: 0,
    prefill: false,
    'prefill-quantity': null,
    reload: false,
    required: false,
    source: null,
    tab: 'default',
    type: 'text',
    value: '',
    file: '',
    visible: true
  }
  
  for (var match; match = re.exec(str); ){
    attrs[match[1]] = match[3] || match[4] || match[5]
  }

  attrs.sourceString = attrs.source
  attrs.source = (attrs.source)? 
    ((json != null && json['abe_source'] != null)? 
      json['abe_source'][attrs.key] : 
      null
    ) : 
    null
  attrs.editable = (attrs.editable) ? true : false

  attrs = Hooks.instance.trigger('afterAbeAttributes', attrs, str, json)

  return attrs
}

export function sanitizeSourceAttribute(obj, jsonPage){
  if(obj.sourceString != null && obj.sourceString.indexOf('{{') > -1) {
    var matches = obj.sourceString.match(/({{[a-zA-Z._]+}})/g)
    if(matches !== null) {
      Array.prototype.forEach.call(matches, (match) => {
        var val = match.replace('{{', '')
        val = val.replace('}}', '')
        
        try {
          val = eval('jsonPage.' + val)
        }catch(e) {
          val = ''
        }
        obj.sourceString = obj.sourceString.replace(match, val)
      })
    }
  }

  return obj
}