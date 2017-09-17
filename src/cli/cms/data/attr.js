import {cmsData} from '../../'

const captureAttr = '-abe-([a-z A-Z]{1}[0-9]{1}.+?)(?=.'
/**
 * Class Attr
 * Work string to manage string attributes key/value
 */
export default class Attr {
  /**
   * @param  {String} str string to work with
   * @return {void}
   */
  constructor(str) {
    this.str = str
    this.val = {}
    this.extract()
  }

  /**
   * @return {Object} attributes extracted from string as an object
   */
  extract() {
    var rex = new RegExp(captureAttr + this.getExtension() + ')')
    if (rex.test(this.str)) {
      var arrAttr = this.str.match(rex)[0].replace('-abe-', '')
      this.val = {
        s: arrAttr[0],
        d: cmsData.revision.getStatusAndDateToFileName(arrAttr.slice(1))
      }
    }
    return this.val
  }

  /**
   * @return {String} str without attributes
   */
  remove() {
    if (this.str != null) {
      return this.str.replace(
        new RegExp(captureAttr + this.getExtension() + ')'),
        ''
      )
    }
    return this.str
  }

  getExtension() {
    if (this.str != null) {
      var ext = this.str.split('.')
      return ext[ext.length - 1]
    }
    return ''
  }

  /**
   * Insert attributes to the string
   * @param  {String} string composed of a status (ex: v for validate, d for draft ...) and a date
   * @return {String} the new string with added attributes
   */
  insert(newValues) {
    var strWithoutAttr = this.remove()
    strWithoutAttr = strWithoutAttr.replace(
      new RegExp('\\.' + this.getExtension()),
      ''
    )
    return strWithoutAttr + '-abe-' + newValues + '.' + this.getExtension()
  }
}
