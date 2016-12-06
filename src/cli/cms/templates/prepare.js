import {
  cmsData
  ,cmsTemplates
} from '../../'

export function addAbeDataAttrForHtmlTag(template) {
  var match
  while (match = cmsData.regex.abePattern.exec(template)) {
    var getattr = cmsData.regex.getAttr(match, 'key').replace(/\./g, '-')
    template = template.replace(
      cmsData.regex.escapeTextToRegex(match[0], 'g'),
      ' data-abe-' + cmsData.regex.validDataAbe(getattr) + '="'  + getattr + '" ' + match[0]
    )
  }

  return template
}

export function addAbeDataAttrForHtmlAttributes(template) {
  var match
  while (match = cmsData.regex.abeAsAttributePattern.exec(template)) { // While regexp match {{attribut}}, ex: link, image ...
    if(cmsData.regex.isSingleAbe(match[0], template)){
      var more_attr = ''
      var getattr = cmsData.regex.getAttr(match, 'key').replace(/\./g, '-')
      template = template.replace(
        new RegExp(match[0]),
        ' data-abe-attr-' + cmsData.regex.validDataAbe(getattr) + '="'  + (match[0].split('=')[0]).trim() + '"' +
        ' data-abe-' + cmsData.regex.validDataAbe(getattr) + '="'  + getattr + '"' +
        more_attr + match[0].replace('}}', ' has-abe=1}}')
      )
    }
  }

  return template
}

export function addAbeSourceComment(template, json) {
  
  // Don't know what it does...
  if(typeof json.abe_source !== 'undefined' && json.abe_source !== null) {
    var keys = Object.keys(json.abe_source)
    
    for(var i in keys) {
      var replaceEach = new RegExp(`<!-- \\[\\[${keys[i]}\\]\\][\\s\\S]*?-->`, 'g')
      template = template.replace(replaceEach, '')

      var patAttrSource = new RegExp(' ([A-Za-z0-9\-\_]+)=["|\'].*?({{' + keys[i] + '}}).*?["|\']', 'g')
      var patAttrSourceMatch = template.match(patAttrSource)

      if(patAttrSourceMatch != null) {
        let checkEscapedRegex = /["|'](.*?)["|']/
        let patAttrSourceInside = new RegExp('(\\S+)=["\']?((?:.(?!["\']?\\s+(?:\\S+)=|[>"\']))+.)["\']?({{' + keys[i] + '}}).*?["|\']', 'g')
        Array.prototype.forEach.call(patAttrSourceMatch, (pat) => {
          let patAttrSourceCheck = patAttrSourceInside.exec(pat)
          if(patAttrSourceCheck != null) {
            
            let checkEscaped = checkEscapedRegex.exec(patAttrSourceCheck[0])
            if(checkEscaped != null && checkEscaped.length > 0) {
              checkEscaped = escape(checkEscaped[1])
              template = template.replace(
                patAttrSourceCheck[0],
                ` data-abe-attr="${patAttrSourceCheck[1]}" data-abe-attr-escaped="${checkEscaped}" data-abe="${keys[i]}" ${patAttrSourceCheck[0]}`
              )
            }
          }
        })
      }

      var eachSource = new RegExp(`({{#each ${keys[i]}}[\\s\\S a-z]*?{{\/each}})`, 'g')
      var matches = template.match(eachSource)
      if(typeof matches !== 'undefined' && matches !== null) {
        Array.prototype.forEach.call(matches, (match) => {
          template = template.replace(match, `${match}<!-- [[${keys[i]}]] ${cmsTemplates.encodeAbeTagAsComment(match)} -->`)
        })
      }
    }
  }

  return template
}

export function addAbeHtmlTagBetweenAbeTags(template) {
  var match
  while (match = cmsData.regex.abePattern.exec(template)) {
    template = template.replace(cmsData.regex.escapeTextToRegex(match[1], 'g'), '<abe>' + match[1].trim() + '</abe>')
  }

  return template
}

export function replaceAbeEachIndex(template) {
  return template.replace(/\[index\]\./g, '{{@index}}-')
}

export function removeHiddenAbeTag(template) {
  return template.replace(/(\{\{abe.*visible=[\'|\"]false.*\}\})/g, '')
}

export function removeHandlebarsRawFromHtml(template) {
  return template.replace(/\{\{\{\{\/?raw\}\}\}\}/g, '')
}

export function splitEachBlocks(template) {
  var block
  var blocks = []

  while (block = cmsData.regex.blockPattern.exec(template)) {
    blocks.push(block[1])
  }

  return blocks
}

export function indexEachBlocks(template, onlyHtml) {
  // create an array of {{each}} blocks
  var blocks = cmsTemplates.prepare.splitEachBlocks()

  Array.prototype.forEach.call(blocks, (block) => {
    var key = block.match(/#each (.*)\}\}/)
    key = key[1]
    var match

    if(!onlyHtml) {

      var voidData = {}
      voidData[key] = [{}]
      var blockCompiled = Handlebars.compile(block.replace(/{{abe (.*?)}}/g, '[[abe $1]]').replace(new RegExp(`\\.\\.\/${config.meta.name}`, 'g'), config.meta.name))
      var blockHtml = blockCompiled(voidData, {data: {intl: config.intlData}}).replace(/\[\[abe (.*?)\]\]/g, '{{abe $1}}')

      // je rajoute un data-abe-block avec index sur tous les tags html du bloc each
      var textEachWithIndex = block.replace(/(<(?![\/])[A-Za-z0-9!-]*)/g, '$1 data-abe-block="' + key + '{{@index}}"')

      // je remplace le block dans le texte par ça
      template = template.replace(block, textEachWithIndex + `<!-- [[${key}]] ${cmsTemplates.encodeAbeTagAsComment(blockHtml)} -->`)
    }

    // Pour chaque tag Abe, je mets en forme ce tag avec des data- supplémentaires
    while (match = cmsData.regex.abePattern.exec(block)) {
      cmsTemplates.prepare.insertAbeEach(match, key, cmsData.regex.eachBlockPattern.lastIndex - block.length)
    }

    // Pour chaque tag Abe attribut de HTML, je mets en forme ce tag avec des data- supplémentaires sur le tag html parent
    while (match = cmsData.regex.abeAsAttributePattern.exec(block)) {
      cmsTemplates.prepare.insertAbeEach(match, key, cmsData.regex.eachBlockPattern.lastIndex - block.length)
    }  
  })

  return template
}

export function insertAbeEach(theMatch, key, lastIndex) {
  var matchBlock = theMatch[0]
  if(cmsData.regex.isEachStatement(matchBlock)) return
  if(cmsData.regex.isBlockAbe(matchBlock)){
    var matchblockattr = (matchBlock.split('=')[0]).trim()
    var getattr = cmsData.regex.getAttr(matchBlock, 'key').replace('.', '[index].')
    var newMatchBlock = ((!this._onlyHTML) ?
                          (/=[\"\']\{\{(.*?)\}\}/g.test(matchBlock) ?
                              ' data-abe-attr-' + cmsData.regex.validDataAbe(getattr) + '="'  + matchblockattr + '"' :
                              '') +
                          ' data-abe-' + cmsData.regex.validDataAbe(getattr) + '="' + getattr + '" ' + matchBlock :
                          matchBlock)
        .replace(new RegExp('(key=[\'|"])' + key + '.', 'g'), '$1' + key + '[index].')
        .replace(/\{\{abe/, '{{abe dictionnary=\'' + key + '\'')

    this.template = this.template.replace(matchBlock, newMatchBlock)
  }

  return this
}