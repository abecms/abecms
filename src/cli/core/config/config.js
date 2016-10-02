import fse from 'fs-extra'
import clc from 'cli-color'
import extend from 'extend'

import config from './config.json'

var result = config
result.root = result.root.replace(/\/$/, '')
var hintAbeJson = false

var loadLocalConfig = (result) => {
  var website = result.root.replace(/\/$/, '')
  if(website !==''){
    try{
      var stat = fse.statSync(website)
      if (stat && stat.isDirectory()) {
        try{
          stat = fse.statSync(website + '/abe.json')
          if (stat) {
            var json = fse.readJsonSync(website + '/abe.json')
            result = extend(true, result, json)
          }
        }catch(e) {
          if (!hintAbeJson) {
            hintAbeJson = true
            console.log(
  						clc.green('[ Hint ]'),
  						'create abe.json to config',
  						clc.cyan.underline('https://github.com/AdFabConnect/abejs/blob/master/docs/abe-config.md')
  					)
          }
        }
      }
    }catch(e){
      console.log('LoadConfig Error')
      console.log(e)
    }
  }
}

loadLocalConfig(result)

result.exist = (conf, json) => {
  var c = conf.split('.')
  var current = json
  if(typeof current !== 'undefined' && current !== null) {
    Array.prototype.forEach.call(c, (c) => {
      if(current !== false && typeof current[c] !== 'undefined' && current[c] !== null) {
        current = current[c]
      }else {
        current = false
        return false
      }
    })
    return current
  }else {
    return false
  }
}

result.getDefault = (conf) => {
  return result[conf]
}

result.get = (conf, file) => {

  return result.exist(conf, result)
}

result.set = (json) => {
  extend(true, result, json)
  loadLocalConfig(result)
}

result.save = (website, json) => {
  extend(true, result, json)

  var confPath = result.root.replace(/\/$/, '') + '/abe.json'
  fse.writeJsonSync(confPath, json, { space: 2, encoding: 'utf-8' })
}

result.getConfigByWebsite = () => {
  var defaultConfig = extend(true, {}, result)
  var configBySite = {
    default: {
			
    }
  }
	
  var localConfig = extend(true, {}, defaultConfig)
  for(var item in localConfig) {
    switch(item) {
    case 'intlData':
      configBySite.default.intlData = localConfig[item]
      break
    case 'templates':
      configBySite.default.templates = localConfig[item]
      break
    case 'structure':
      configBySite.default.structure = localConfig[item]
      break
    case 'data':
      configBySite.default.data = localConfig[item]
      break
    case 'draft':
      configBySite.default.draft = localConfig[item]
      break
    case 'publish':
      configBySite.default.publish = localConfig[item]
      break
    case 'files':
      configBySite.default.files = {
        templates: {
          extension: localConfig[item].templates.extension
        }
      }
      break
    case 'upload':
      configBySite.default.upload = localConfig[item]
      break
    }
  }
	
  return configBySite
}

export default result