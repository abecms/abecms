import {
  cmsData
  ,config
} from '../../'

export function add(tpl, json, type, obj = {}, date = null, realType = 'draft') {
  let meta = config.meta.name

  var currentDate = (date != null && date !== '') ? date : new Date()
  var abeUrl = (type === 'publish') ? json[meta].link : cmsData.fileAttr.add(json[meta].link, 'd' + cmsData.revision.removeStatusAndDateFromFileName(currentDate.toISOString())) + ''

  if(json[meta].date == null) {
    json[meta].date = currentDate
  }
  json[meta].latest = {
    date: currentDate,
    abeUrl: abeUrl
  }
  json[meta].status = realType === 'reject' ? 'draft' : realType
  if(json[meta][type] == null) {
    json[meta][type] = JSON.parse(JSON.stringify(obj))
    json[meta][type].date = currentDate
    json[meta][type].abeUrl = abeUrl
  }
  json[meta][type].latest = JSON.parse(JSON.stringify(obj))
  json[meta][type].latest.date = currentDate
  json[meta][type].latest.abeUrl = abeUrl
}

export function get(arr) {
  var res = []
  Array.prototype.forEach.call(arr, (file) => {
    let meta = config.meta.name

    var jsonPath = cmsData.file.fromUrl(file.path).json.path
    var json = cmsData.file.get(jsonPath)
    if(json[meta] == null) json[meta] = {}
    file['template'] = json[meta].template
    if(json[meta].latest != null) {
      file['date'] = json[meta].latest.date
    }
    if(json[meta].complete == null) {
      json[meta].complete = 0
    }
    if(json[meta] != null) {
      file[config.meta.name] = json[meta]
    }
    res.push(file)
  })

  return res
}