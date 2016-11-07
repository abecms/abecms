import {
  cmsData
  ,config
} from '../../'

export function add(json, type, date = null) {
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
  json[meta].status = type
  if(json[meta][type] == null) {
    json[meta][type] = {latest: {}}
    json[meta][type].date = currentDate
    json[meta][type].abeUrl = abeUrl
  }
  // json[meta][type].latest = JSON.parse(JSON.stringify(obj))
  json[meta][type].latest.date = currentDate
  json[meta][type].latest.abeUrl = abeUrl
}
