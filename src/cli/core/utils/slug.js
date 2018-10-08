import slug from 'slugify'
import path from 'path'

import {config} from '../../'

export function clean(str) {
  if (typeof str === 'undefined' || str === null) return null
  str = str.split('/')
  str[str.length - 1] = slugify(decodeURIComponent(str[str.length - 1]))
  return str.join('/')
}

function slugify(str) {
  str = str.replace(/\..+$/, '').toLowerCase()
  str = slug(str, {remove: /[$*+~.()'"!\:@§^,;]/g})
  str = `${str}.${config.files.templates.extension}`
  return str.toLowerCase()
}
