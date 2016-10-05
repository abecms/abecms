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
  attrs.source = (typeof attrs.source !== 'undefined' && attrs.source !== null && attrs.source !== '')? 
    ((typeof json['abe_source'] !== 'undefined' && json['abe_source'] !== null && json['abe_source'] !== '')? 
      json['abe_source'][attrs.key] : 
      null
    ) : 
    null
  attrs.editable = (typeof attrs.editable === 'undefined' || attrs.editable === null || attrs.editable === '' || attrs.editable === 'false') ? false : true

  attrs = Hooks.instance.trigger('afterAbeAttributes', attrs, str, json)

  return attrs
}