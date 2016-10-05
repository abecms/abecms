import {
  cmsData
} from '../../'

/**
 * Encode / Escape && add data-abe attributs
 * @param  {String} block
 * @return {String} escaped string
 */
export default function encodeAbeTagAsComment(block){
  var matchAbe = block.match(/>\s*\{\{abe .*\}\}/g)
  if(matchAbe){
    for (var i = 0; i < matchAbe.length; i++){
      var getattr = cmsData.regex.getAttr(matchAbe[i], 'key').replace('.', '[0]-')
      block = block.replace(
        matchAbe[i],
        ' data-abe-' + cmsData.regex.validDataAbe(getattr) + '="'  + getattr + '" >'
      )
    }
  }
  matchAbe = block.match(/( [A-Za-z0-9\-\_]+="*{{.*?}})/g)
  if(matchAbe){
    for (var i = 0; i < matchAbe.length; i++) {
      if(typeof matchAbe !== 'undefined' && matchAbe !== null){
        var getattr = cmsData.regex.getAttr(matchAbe[i], 'key').replace('.', '[0]-')
        var matchattr = (matchAbe[i].split('=')[0]).trim()
        block = block.replace(
            matchAbe[i],
            ' data-abe-attr-' + cmsData.regex.validDataAbe(getattr) + '="'  + matchattr + '"' +
            ' data-abe-' + cmsData.regex.validDataAbe(getattr) + '="'  + getattr + '" ' + matchAbe[i]
          )
          .replace(/\{\{\abe.*?}\}/, '')
      }
    }
  }
  return escape(block)
}