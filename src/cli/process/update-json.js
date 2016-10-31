// ./node_modules/.bin/babel-node src/cli/process/publish-all.js ABE_WEBSITE=/path/to/website
// ./node_modules/.bin/babel-node src/cli/process/publish-all.js FILEPATH=/path/to/website/path/to/file.html ABE_WEBSITE=/path/to/website
import path from 'path'
import {
  config,
  coreUtils,
  abeExtend
} from '../../cli'

var pConfig = {}
Array.prototype.forEach.call(process.argv, (item) => {
  if (item.indexOf('=') > -1) {
    var ar = item.split('=')
    pConfig[ar[0]] = ar[1]
  }
})

if(typeof pConfig.ABE_WEBSITE !== 'undefined' && pConfig.ABE_WEBSITE !== null) {
  if(pConfig.ABE_WEBSITE) config.set({root: pConfig.ABE_WEBSITE.replace(/\/$/, '') + '/'})
  pConfig.FILEPATH = path.join(config.root, config.data.url, pConfig.FILEPATH ? pConfig.FILEPATH.replace(config.root) : '')
  const extension = '.json'
  let allJson
  
  allJson = coreUtils.file.getFilesSync(pConfig.FILEPATH, true, extension)
  abeExtend.hooks.instance.trigger('beforeUpdateJson', allJson)

}else {
  console.log('ABE_WEBSITE is not defined use node process.js ABE_WEBSITE=/pat/to/website')
  process.exit(0)
}
