import {
  cmsData
  ,config
  ,dateSlug
} from '../../'

export function add(tpl, json, type, obj = {}, date = null, realType = 'draft') {
  let meta = config.meta.name

  var currentDate = (typeof date !== 'undefined' && date !== null && date !== '') ? date : new Date()
  var abeUrl = (type === 'publish') ? json[meta].link : cmsData.fileAttr.add(json[meta].link, 'd' + dateSlug(currentDate.toISOString())) + ''

  if(typeof json[meta].date === 'undefined' || json[meta].date === null) {
    json[meta].date = currentDate
  }
  json[meta].latest = {
    date: currentDate,
    abeUrl: abeUrl
  }
  json[meta].status = realType === 'reject' ? 'draft' : realType
  if(typeof json[meta][type] === 'undefined' || json[meta][type] === null) {
    json[meta][type] = JSON.parse(JSON.stringify(obj))
    json[meta][type].date = currentDate
    json[meta][type].abeUrl = abeUrl
  }
  json[meta][type].latest = JSON.parse(JSON.stringify(obj))
  json[meta][type].latest.date = currentDate
  json[meta][type].latest.abeUrl = abeUrl
}