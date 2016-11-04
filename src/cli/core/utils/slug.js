import slug from 'limax'
import path from 'path'

import {
  config
} from '../../'

export function clean(str) {

  if (typeof str === 'undefined' || str === null) return null
  str = str.split(path.sep)
  str[str.length - 1] = slugify(decodeURIComponent(str[str.length - 1]))
  return str.join('/')
}

function slugify(str) {
  str = str.replace(/\..+$/, '')
  str = slug(str, {separateNumbers: false})
  str = `${str}.${config.files.templates.extension}`
  return str.toLowerCase()
}