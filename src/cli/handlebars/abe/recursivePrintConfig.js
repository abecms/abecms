
export default function recursivePrintConfig(obj, key = '') {
  var res = ''

  if(typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]') {
    Array.prototype.forEach.call(Object.keys(obj), (k) => {
      var strKey = key
      if(strKey !== '') {
        strKey += '.'
      }
      strKey += k
      res += recursivePrintConfig(obj[k], strKey)
    })
  }else {
    res += `<div class="form-group">
      <label class="col-sm-4 control-label" for="${key}">${key}</label>
      <div class="col-sm-8">
        <input type="text" class="form-control" id="${key}" data-json-key="${key}" placeholder="${obj}" value="${obj}">
      </div>
    </div>`
  }

  return res
}
