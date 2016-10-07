import fse from 'fs-extra'

export default class FileUtils {

  constructor() {}

	/**
	 * Check if the path given coreespond to an existing file
	 * @param  {string}  path The path
	 * @return {Boolean}      Does the file exist
	 */
  static isFile(pathFile) {
    try{
      fse.statSync(pathFile)
      return true
    }catch(e){
      return false
    }

    return false
  }

  /**
   * This method checks that the path leads to a file and return the content as UTF-8 content
   * @param  {string} path The path
   * @return {string}      The content of the UTF-8 file
   */
  static getFileContent(pathFile) {
    var res = null
    if(typeof pathFile !== 'undefined' && pathFile !== null && pathFile !== '') {
      if (FileUtils.isFile(pathFile)) {
        res = fse.readFileSync(pathFile, 'utf8')
      }
    }
    return res
  }

}
