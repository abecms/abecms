'use strict'
var path = require('path');

var hooks = {
  afterEditorInput: function (htmlString, params, abe) {
    if(abe.config.abeTags.code != null && params.type.indexOf('code') >= 0){
      var codeAttrMode = 'text/html'
      var codeAttrTheme = 'material'
      if(params.mode)
        codeAttrMode = params.mode
      if(params.theme)
        codeAttrTheme = params.theme

      var regexReplace = /<div class="input-group">([\S\s]*?\/>[\S\s]*?<\/div>)/g
      var matches = htmlString.match(regexReplace)
      var attributes = abe.cmsEditor.getAttributes(params)
      //console.log(matches[0])
      //console.log(params)
      htmlString = htmlString.replace(
        matches[0],
        '<div class="code">' +
          '<textarea style="display:none" class="form-abe form-code-display abe-format-html abe-keep-format" ' + attributes + '></textarea>' +
          '<textarea class="form-control form-abe form-code abe-format-html abe-keep-format" ' + attributes + ' data-code-mode="'+codeAttrMode+'" data-code-theme="'+codeAttrTheme+'" rows="4">'+params.value+'</textarea>' +
          abe.cmsEditor.hint(params) +
        '</div>'
      )
    }

    return htmlString
  }
}

exports.default = hooks;
