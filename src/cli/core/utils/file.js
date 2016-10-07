import fse from 'fs-extra'

export function exist(pathFile) {
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
export function getContent(pathFile) {
  var res = null
  if(typeof pathFile !== 'undefined' && pathFile !== null && pathFile !== '') {
    if (exist(pathFile)) {
      res = fse.readFileSync(pathFile, 'utf8')
    }
  }
  return res
}