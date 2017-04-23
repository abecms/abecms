import {
  cmsData
  ,config
} from '../../'

export function add(json, type, date = null, user = null) {

  const meta = config.meta.name
  const currentDate = (date != null && date !== '') ? date : new Date()
  //const abeUrl = (type === 'publish') ? json[meta].link : cmsData.fileAttr.add(json[meta].link, type[0] + cmsData.revision.removeStatusAndDateFromFileName(currentDate.toISOString())) + ''

  if(json['abeEditor']) delete json['abeEditor']
  if(json['oldFilePath']) delete json['oldFilePath']

  json[meta].updatedDate = currentDate
  json[meta].updatedBy = (user === null)? 'admin':user.username
  json[meta].status = type
}

export function create(json, template, url, user = null) {
  const meta = config.meta.name
  if (json[meta] == null) {
    json[meta] = {}
  }

  json[meta].template = template
  json[meta].link = url
  json[meta].createdDate = new Date()
  json[meta].createdBy = (user === null)? 'admin':user.username

  return json
}
