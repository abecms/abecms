import path from 'path'
import fs from 'fs'
import attr from './attr'

import {cmsData} from '../../'

/**
 * Class FileAttr
 * Manage string with attributes encoded inside
 */
export default class FileAttr {
  /**
   * Add attributes or modify them if they already exists
   * @param {String} str the string to modify
   * @param {Object} options object with attributes to add
   * @return {String} the string with the new attributes
   */
  static add(str, options) {
    var att = new attr(str)

    return att.insert(options)
  }

  /**
   * Remove attributes from string
   * @param {String} str the string to modify
   * @return {String} the string modified
   */
  static delete(str) {
    return new attr(str).remove()
  }

  /**
   * @param  {String} str the string to get attributes from
   * @return {object|String} object (all the attributes) if the key is null, if not the value of the attribute
   */
  static get(str) {
    return new attr(str).val
  }

  /**
   * @param  {String} str the string to test attributes from
   * @return {boolean} true if string has attr
   */
  static test(str) {
    var att = new attr(str).val

    return att.s != null
  }

  /**
   *
   * @param {String} pathFile
   */
  static getDate(pathFile) {
    let name = path.basename(pathFile)
    const fileData = cmsData.fileAttr.get(name)
    name = cmsData.fileAttr.delete(name)

    let date
    if (fileData.d) {
      date = fileData.d
    } else {
      pathFile = cmsData.utils.getRevisionPath(pathFile)
      const stat = fs.statSync(pathFile)
      date = stat.mtime
    }

    return date
  }
}
