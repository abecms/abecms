import slug from 'limax'

import {
  config,
  fileUtils
} from '../../cli'

function cleanSlug(str) {

  if (typeof str === 'undefined' || str === null) return null;
  if (str.indexOf('.') === -1) { // no extension add one
    str = `${str}.${config.files.templates.extension}`
  }
  str = str.split('/')
  str[str.length - 1] = slugify(decodeURIComponent(str[str.length - 1]))
  return str.join('/')
}

function slugify(str) {
  str = fileUtils.removeExtension(str)
  str = slug(str)
  str = `${str}.${config.files.templates.extension}`
  return str.toLowerCase()
}

export {cleanSlug as cleanSlug}
export default slugify