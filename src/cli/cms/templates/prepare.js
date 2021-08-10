import Handlebars from 'handlebars'
import striptags from 'striptags'

import {cmsData, config, cmsTemplates} from '../../'

export function addAbeAttrSingleTab(key, elem, htmlAttribute = null) {
  var res = ''

  var valueOfAttribute = key.replace(/\./g, '-')
  key = cmsData.regex.validDataAbe(valueOfAttribute)

  if (htmlAttribute != null) {
    res =
      ' data-abe-attr-' +
      valueOfAttribute +
      '="' +
      htmlAttribute +
      '"' +
      ' data-abe-' +
      valueOfAttribute +
      '="' +
      key +
      '"' +
      elem
  } else {
    res = ' data-abe-' + key + '="' + key + '" ' + elem
  }

  return res
}

export function addAbeAttrForBlock(key, elem, htmlAttribute = null) {
  var res = ''

  var valueOfAttribute = key.split('.')
  var parentKey = valueOfAttribute.shift()
  valueOfAttribute = `${parentKey}[index].${valueOfAttribute[0].replace(
    /\./g,
    '-'
  )}`
  var valueOfAttributeIndexed = valueOfAttribute.replace(
    /\[index\]/,
    '{{@index}}'
  )
  key = cmsData.regex.validDataAbe(valueOfAttribute)

  if (htmlAttribute) {
    res =
      ` data-abe-attr-${valueOfAttribute}="${htmlAttribute}"  data-abe-${valueOfAttribute}="${key}"` +
      ` data-abe-attr-${valueOfAttributeIndexed}="${htmlAttribute}" data-abe-${valueOfAttributeIndexed}="${key}"${elem}`
  } else {
    res =
      ` data-abe-${valueOfAttribute}="${key}"` +
      ` data-abe-${valueOfAttributeIndexed}="${key}" ${elem}`
  }

  return res
}

/**
 * THIS:
<span>{{abe type='text' key='text_visible'}}</span>

 * BECOMES:
<span data-abe-text_visible="text_visible" >{{abe type='text' key='text_visible'}}</span>

 * @param {[type]} template [description]
 */
export function addAbeDataAttrForHtmlTag(template) {
  var match
  var key
  var getattr
  var newTemplate = template
  var pattern = cmsData.regex.abePattern()

  while ((match = pattern.exec(template))) {
    key = cmsData.regex.getAttr(match, 'key')

    if (!cmsData.regex.isSingleAbe(match, newTemplate)) {
      key = key.replace('.', '{{@index}}.')
    }

    getattr = key.replace(/\./g, '-')
    const escapedText = cmsData.regex.escapeTextToRegex(match[0], 'g')
    const replacementText = ' data-abe-' +
    cmsData.regex.validDataAbe(getattr) +
    '="' +
    getattr +
    '" ' +
    match[0]

    newTemplate = newTemplate.replace(
      escapedText,
      replacementText
    )
  }

  return newTemplate
}

// Is this function useful ? What is it used for ?
export function addHasAbeAttr(text) {
  return text.replace('}}', " has-abe='1'}}")
}

export function getAbeAttributeData(match, text, htmlAttribute, abeTag) {
  var key = cmsData.regex.getAttr(match, 'key')
  var res

  if (cmsData.regex.isSingleAbe(match, text)) {
    res = addAbeAttrSingleTab(key, abeTag, htmlAttribute)
  } else {
    res = addAbeAttrForBlock(key, abeTag, htmlAttribute)
  }

  return res
}

/**
 *
 * IF ABE TAG SINGLE (NOT ABE EACH STATEMENT)
 *
 * THIS:
<img src="{{abe type='image' key='image_key' tab='default'}}" alt="">

 * BECOMES:
<img data-abe-attr-image_key="src" data-abe-image_key="image_key" data-abe-attr-image_key="src"
data-abe-image_key="image_key" src="{{abe type='image' key='image_key' tab='default' has-abe='1'}}" alt="">

 *
 * IF ABE EACH TAG
 * THIS:
{{#each test}}
  <img src="{{abe type='image' key='test.img' desc='test_img' tab='default'}}" alt="">
{{/each}}

 * BECOMES:
{{#each test}}
  <img data-abe-attr-test[index].img="src" data-abe-test[index].img="test[index].img" src="{{abe type='image' key='test.img' desc='test_img' tab='default' has-abe='1'}}" alt="">
{{/each}}

 * @param {[type]} template [description]
 */
export function addAbeDataAttrForHtmlAttributes(template) {
  var text = template.replace(/<([A-Za-z]+)/g, '\nABE_SPLIT<$1')
  let abeTagIntoAttribute = text.match(cmsData.regex.abeAsAttributePattern)

  if (abeTagIntoAttribute != null) {
    Array.prototype.forEach.call(abeTagIntoAttribute, abeIntoTag => {
      let matchAbeTag = /({{abe.*?[\s\S].*?}})/g.exec(abeIntoTag)

      if (matchAbeTag != null && matchAbeTag[1] != null) {
        var toReplace = cmsTemplates.prepare.getAbeAttributeData(
          matchAbeTag[1],
          text,
          abeIntoTag.split('=')[0].trim(),
          abeIntoTag
        )

        toReplace = toReplace.replace(
          cmsData.regex.escapeTextToRegex(matchAbeTag[1]),
          cmsTemplates.prepare.addHasAbeAttr(matchAbeTag[1])
        )

        text = text.replace(
          cmsData.regex.escapeTextToRegex(abeIntoTag),
          toReplace
        )
      }
    })
  }
  text = text.replace(/\nABE_SPLIT</g, '<')

  return text
}

/**
 * Example:
 *
 *
 * THIS:
{{abe type='data' key='data_key' source='select title from article' display='title' editable='true' tab='default'}}

{{#each data_key}}
  {{title}}
{{/each}}

 *
 * BECOMES

{{abe type='data' key='data_key' source='select title from article' display='title' editable='true' tab='default'}}

{{#each data_key}}
  {{title}}
{{/each}}<!-- [[data_key]] %7B%7B%23each%20data_key%7D%7D%0A%09%7B%7Btitle%7D%7D%0A%7B%7B/each%7D%7D -->

 * @param {[type]} template [description]
 * @param {[type]} json     [description]
 */
export function addAbeSourceComment(template, json) {
  if (typeof json.abe_source !== 'undefined' && json.abe_source !== null) {
    var keys = Object.keys(json.abe_source)

    for (var i in keys) {
      var replaceEach = new RegExp(
        `<!-- \\[\\[${keys[i]}\\]\\][\\s\\S]*?-->`,
        'g'
      )
      var regexEachKey = new RegExp(`{{#each ${keys[i]}}}`, 'g')
      template = template.replace(replaceEach, '')

      var patAttrSource = new RegExp(
        ' ([A-Za-z0-9-_]+)=["|\'].*?({{' + keys[i] + '}}).*?["|\']',
        'g'
      )
      var patAttrSourceMatch = template.match(patAttrSource)

      if (patAttrSourceMatch != null) {
        let checkEscapedRegex = /["|'](.*?)["|']/
        let patAttrSourceInside = new RegExp(
          '(\\S+)=["\']?((?:.(?!["\']?\\s+(?:\\S+)=|[>"\']))+.)["\']?({{' +
            keys[i] +
            '}}).*?["|\']',
          'g'
        )
        Array.prototype.forEach.call(patAttrSourceMatch, pat => {
          let patAttrSourceCheck = patAttrSourceInside.exec(pat)
          if (patAttrSourceCheck != null) {
            let checkEscaped = checkEscapedRegex.exec(patAttrSourceCheck[0])
            if (checkEscaped != null && checkEscaped.length > 0) {
              checkEscaped = escape(checkEscaped[1])
              template = template.replace(
                patAttrSourceCheck[0],
                ` data-abe-attr="${patAttrSourceCheck[1]}" data-abe-attr-escaped="${checkEscaped}" data-abe="${keys[
                  i
                ]}" ${patAttrSourceCheck[0]}`
              )
            }
          }
        })
      }

      var eachSource = new RegExp(
        `({{#each ${keys[i]}}[\\s\\S a-z]*?{{\/each}})`,
        'g'
      )
      var matches = template.match(eachSource)
      if (typeof matches !== 'undefined' && matches !== null) {
        Array.prototype.forEach.call(matches, match => {
          template = template.replace(
            match,
            `${match}<!-- [[${keys[i]}]] ${cmsTemplates.encodeAbeTagAsComment(
              match
            )} -->`
          )
        })
      }
    }
  }

  return template
}

//THIS:
//<span>{{abe type='text' key='text_visible'}}</span>
//OR
//<style>{{abe type='text' key='text_visible'}}</style>
//OR
//<script>{{abe type='text' key='text_visible'}}</script>
//BECOMES:
//<span><!--ABE--->{{abe type='text' key='text_visible'}}<!--/ABE---></span>
//OR
//<style>/*<!--ABE--->*/{{abe type='text' key='text_visible'}}/*<!--/ABE--->*/</style>
//OR
//<script>/*<!--ABE--->*/{{abe type='text' key='text_visible'}}/*<!--/ABE--->*/</script>

/**
 * @param {[type]} template [description]
 */
export function addAbeHtmlTagBetweenAbeTags(template) {
  var match
  var match2
  var templateNoDom = striptags(template)
  var pattern = cmsData.regex.abeAsTagPattern()

  // {{#each tags may be declared outside of an html Tag}}
  while ((match = cmsData.regex.eachBlockPattern.exec(template))) {
    const escapedText = cmsData.regex.escapeTextToRegex(match[1], 'g')
    template = template.replace(
      escapedText,
      '<!--ABE--->' + match[1].trim() + '<!--/ABE--->'
    )
  }

  while ((match = pattern.exec(templateNoDom))) {
    //console.log('match', match[1].trim());
    const escapedText = cmsData.regex.escapeTextToRegex(match[1], 'g')
    //console.log('escapedText', escapedText);
    template = template.replace(
      escapedText,
      '<!--ABE--->' + match[1].trim() + '<!--/ABE--->'
    )
    //console.log('template', template);
  }

  let eachStyles = /<style[\S\s]*?<\/style>/g
  let eachStylePattern = /<style[\S\s]*?(<!--ABE[\S\s]*?--->)[\S\s]*?(<!--\/ABE--->)[\S\s]*?<\/style>/g
  while ((match = eachStyles.exec(template))) {
    var res = match[0]
    while ((match2 = eachStylePattern.exec(res))) {
      res = res
        .replace(
          cmsData.regex.escapeTextToRegex(match2[1], 'g'),
          '/*' + match2[1] + '*/'
        )
        .replace(
          cmsData.regex.escapeTextToRegex(match2[2], 'g'),
          '/*' + match2[2] + '*/'
        )
      template = template.replace(
        cmsData.regex.escapeTextToRegex(match[0], 'g'),
        res
      )
    }
  }

  let eachScripts = /<script[\S\s]*?<\/script>/g
  let eachScriptPattern = /<script[\S\s]*?(<!--ABE[\S\s]*?--->)[\S\s]*?(<!--\/ABE--->)[\S\s]*?<\/script>/g
  while ((match = eachScripts.exec(template))) {
    var res = match[0]
    while ((match2 = eachScriptPattern.exec(res))) {
      res = res
        .replace(
          cmsData.regex.escapeTextToRegex(match2[1], 'g'),
          '/*' + match2[1] + '*/'
        )
        .replace(
          cmsData.regex.escapeTextToRegex(match2[2], 'g'),
          '/*' + match2[2] + '*/'
        )
      template = template.replace(
        cmsData.regex.escapeTextToRegex(match[0], 'g'),
        res
      )
    }
  }

  return template
}

/**
 * THIS:
[index].

 * BECOMES:
{{@index}}-

 *  @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
export function replaceAbeEachIndex(template) {
  return template.replace(/\[index\]\./g, '{{@index}}-')
}

export function removeHiddenAbeTag(template) {
  return template.replace(/(\{\{abe.*visible=[\'|\"]false.*\}\})/g, '')
}

/**
 * Remove {{abe type=*}} from html if attribute visible="false"
 * @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
export function removeHandlebarsRawFromHtml(template) {
  return template.replace(/\{\{\{\{\/?raw\}\}\}\}/g, '')
}

/**
 * split {{#each}}...{{/each}} into an array
 *
 * @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
export function splitEachBlocks(template) {
  var block
  var blocks = []

  while ((block = cmsData.regex.eachBlockPattern.exec(template))) {
    blocks.push(block[1])
  }

  return blocks
}

export function indexEachBlocks(template, json, onlyHtml) {
  // create an array of {{each}} blocks
  var blocks = cmsTemplates.prepare.splitEachBlocks(template)

  Array.prototype.forEach.call(blocks, block => {
    var key = block.match(/#each (.*?)\}\}/)[1]
    var match

    if (!onlyHtml) {
      var voidData = {}
      voidData[key] = [{}]
      var blockCompiled = Handlebars.compile(
        block
          .replace(/{{abe (.*?["'])[ ]?( has\-abe=1)?}}/g, '[[abe $1]]')
          .replace(
            new RegExp(`\\.\\.\/${config.meta.name}`, 'g'),
            config.meta.name
          )
      )
      var blockHtml = blockCompiled(voidData, {
        data: {intl: config.intlData, config: config}
      }).replace(/\[\[abe (.*?)\]\]/g, '{{abe $1}}')

      // je rajoute un data-abe-block avec index sur tous les tags html du bloc each
      var textEachWithIndex = block.replace(
        /(<(?![\/])[A-Za-z0-9!-]*)/g,
        '$1 data-abe-block="' + key + '{{@index}}"'
      )

      // I add an each block commentary only if the each block key != key of a type=data abe tag
      var keys = []
      if (typeof json.abe_source !== 'undefined' && json.abe_source !== null) {
        keys = Object.keys(json.abe_source)
      }
      if (keys.indexOf(key) === -1) {
        template = template.replace(
          block,
          textEachWithIndex +
            `<!-- [[${key}]] ${cmsTemplates.encodeAbeTagAsComment(
              blockHtml
            )} -->`
        )
      }
    }

    // Pour chaque tag Abe
    while ((match = cmsData.regex.abeTag.exec(block))) {
      template = cmsTemplates.prepare.addAbeDictionnary(template, match[0], key)
    }
  })

  return template
}

/**
 * split {{#each}}...{{/each}} into an array
 *
 * THIS:
  {{abe type='text' key='test.title' desc='test title' tab='default'}}

 * BECOMES:
  {{abe dictionnary='test' type='text' key='test.title' desc='test title' tab='default'}}

 *
 * @param  {[type]} template [description]
 * @return {[type]}          [description]
 */
export function addAbeDictionnary(template, match, key) {
  if (cmsData.regex.isEachStatement(match)) return

  if (cmsData.regex.isBlockAbe(match)) {
    var abeDictionnary = match
      .replace(
        new RegExp('(key=[\'|"])' + key + '.', 'g'),
        '$1' + key + '[index].'
      )
      .replace(/\{\{abe/, "{{abe dictionnary='" + key + "'")

    template = template.replace(match, abeDictionnary)
  }

  return template
}
