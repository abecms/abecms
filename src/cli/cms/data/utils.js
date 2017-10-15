import path from 'path'

import {config, cmsData, Manager} from '../../'

export function getPercentOfRequiredTagsFilled(text, json) {
  var regAbe = /{{abe[\S\s].*?key=['|"]([\S\s].*?['|"| ]}})/g
  var matches = text.match(regAbe)
  var requiredValue = 0
  var complete = 0
  if (typeof matches !== 'undefined' && matches !== null) {
    Array.prototype.forEach.call(matches, match => {
      if (typeof match !== 'undefined' && match !== null) {
        var keyAttr = cmsData.regex.getAttr(match, 'key')
        var requiredAttr = cmsData.regex.getAttr(match, 'required')
        if (requiredAttr === 'true') {
          requiredValue++

          var minAttr = cmsData.regex.getAttr(match, 'min-length')
          minAttr = minAttr !== '' ? minAttr : 0

          if (
            typeof json[keyAttr] !== 'undefined' &&
            json[keyAttr] !== null &&
            json[keyAttr] !== ''
          ) {
            if (minAttr > 0) {
              if (json[keyAttr].length >= minAttr) {
                complete++
              }
            } else {
              complete++
            }
          }
        }
      }
    })
  }

  return Math.round(requiredValue > 0 ? complete * 100 / requiredValue : 100)
}

/**
 * Remove the data absolute path from the jsonPath
 * ex. jsonPath = /Users/grg/programmation/git/abetesttheme/data/fr/test-abe-d20170418T130602280Z.json
 * return fr/test-abe-d20170418T130602280Z.json
 * and returns this relative path to the json revision
 * @param  {[type]} jsonPath [description]
 * @return {[type]}          [description]
 */
export function getRevisionRelativePath(jsonPath) {
  const pathData = path.join(config.root, config.data.url) + path.sep
  return jsonPath.replace(pathData, '')
}

/**
 * Return the absolute path of the doc from the post URL
 * @param  {[type]} postUrl [description]
 * @return {[type]}         [description]
 */
export function getDocPathFromPostUrl(postUrl) {
  const pathData = path.join(config.root, config.data.url)
  const extension = '.json'
  const templateExtension = '.' + config.files.templates.extension
  const osJsonPath = postUrl
    .replace(templateExtension, extension)
    .replace('/', path.sep)
  return path.join(pathData, osJsonPath)
}

/**
 * Return the absolute path of the doc from a post URL, a status and a date
 * @param  {[type]} postUrl [description]
 * @return {[type]}         [description]
 */
export function getDocPathFromLinkStatusDate(jsonData) {
  let jsonObject = cmsData.file.getAbeMeta({}, jsonData)
  let dateIso = jsonObject.abe_meta.date
  if (typeof dateIso === 'object') {
    dateIso = dateIso.toISOString()
  }
  const statusDate =
    jsonObject.abe_meta.status[0] +
    cmsData.revision.removeStatusAndDateFromFileName(dateIso)
  return getDocPathFromPostUrl(
    cmsData.fileAttr.add(jsonObject.abe_meta.link, statusDate)
  )
}

/**
 * Remove the date revision from the jsonPath and returns the doc full path (which is the published json)
 * ex. jsonPath = /Users/grg/programmation/git/abetesttheme/data/fr/test-abe-d20170418T130602280Z.json
 * return /Users/grg/programmation/git/abetesttheme/data/fr/test.json
 * @param  {[type]} jsonPath [description]
 * @return {[type]}          [description]
 */
export function getDocPath(jsonPath) {
  return cmsData.fileAttr.delete(jsonPath)
}

/**
 * Remove the date revision from the jsonPath and returns the doc relative path (which is the published json)
 * ex. jsonPath = /Users/grg/programmation/git/abetesttheme/data/fr/test-abe-d20170418T130602280Z.json
 * return fr/test.json
 * @param  {[type]} jsonPath [description]
 * @return {[type]}          [description]
 */
export function getDocRelativePath(jsonPath) {
  return cmsData.fileAttr.delete(getRevisionRelativePath(jsonPath))
}

/**
 * Remove the date revision from the jsonPath and returns the html full path (which is the published post)
 * ex. jsonPath = /Users/grg/programmation/git/abetesttheme/data/fr/test-abe-d20170418T130602280Z.json
 * return /Users/grg/programmation/git/abetesttheme/site/fr/test.html
 * can be:
 * - the full path to the revision : /Users/myname/myAbeBlog/data/fr/abe/is/awesome-d-20170808020202TZ.json
 * - the relative path to the revision : fr/abe/is/awesome-d-20170808020202TZ.json
 * - the full path to the doc : /Users/myname/myAbeBlog/data/fr/abe/is/awesome.json
 * - the relative path to the doc : fr/abe/is/awesome.json
 * - the relative path to the post : fr/abe/is/awesome.html
 *
 * will return : /Users/myname/myAbeBlog/site/fr/abe/is/awesome.html
 * 
 * @param  {[type]} jsonPath [description]
 * @return {[type]}          [description]
 */
export function getPostPath(jsonPath) {
  return path.join(
    Manager.instance.pathPublish,
    getPostRelativePath(jsonPath)
  )
}

/**
 * Remove the date revision from the jsonPath and returns the html relative path (which is the published post)
 * ex. jsonPath = /Users/grg/programmation/git/abetesttheme/data/fr/test-abe-d20170418T130602280Z.json
 * return fr/test.html (under window it could be fr\test.html)
 * @param  {[type]} jsonPath [description]
 * @return {[type]}          [description]
 */
export function getPostRelativePath(jsonPath) {
  const extension = '.json'
  const templateExtension = '.' + config.files.templates.extension

  return getDocRelativePath(jsonPath).replace(extension, templateExtension)
}

/**
 * Remove the date revision from the jsonPath and returns the URL absolute path of the published post)
 * ex. jsonPath = /Users/grg/programmation/git/abetesttheme/data/fr/test-abe-d20170418T130602280Z.json
 * return fr/test.html
 * @param  {[type]} jsonPath [description]
 * @return {[type]}          [description]
 */
export function getPostUrl(jsonPath) {
  const extension = '.json'
  const templateExtension = '.' + config.files.templates.extension

  return path.join(
    '/',
    getPostRelativePath(jsonPath).replace(extension, templateExtension)
  )
}
