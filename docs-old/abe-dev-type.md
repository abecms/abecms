# Add an Abe type

## Introduction
You'll have to follow these steps to add a new type to Abe:
- Server side, Abe must recognize your type. Once recognized, Abe will create the HTML partial for this type and render it in the editor part.

- Client side, you'll be able to attach js behaviors to your type. You'll be able to adapt the way it updates the page displayed in the iFrame. On save, you may choose the way you serialize the data.

## SERVER
### src/cli/core/config/config.json
add the type to abeTags

### src/cli/cms/data/regex.js (recognize the new type)
abePattern updated
abeAsTagPattern updated

### src/cli/cms/editor/handlebars/printInput.js (create the HTML partial for the editor)
Create a function to handle the new input type if necessary. here you will create the html to display your type options on the editor
(see lines from 375 in printInput() function)

## CLIENT (create a js function to handle events or do particular actions on your type)
### src/server/public/abecms/scripts/modules/EditorInputs.js
if you need a particular behavior, update _inputElements(). Here you'll trigger js to handle your HTML type (ie. trigger a calendar popup through JS)

### src/server/public/abecms/scripts/modules/EditorSave.js (Choose the way you serialize the data on save)
If you need to handle the value entered by the user in your type, it's in serializeForm()

### src/server/public/abecms/scripts/modules/EditorUtils.js (choose how you update the page in the iFrame)
formToHtml will update the iframe (the page displayed in the editor).
So if you need to update the page in a particular way for your
type, it's in there

### src/server/views/template-engine.html (additional js libraries, css ?)
The template of the editor. If you need additional js, css ...
It's there.

# Example
adding a "code" type to make it possible to code in Abe:

## SERVER
### src/cli/core/config/config.json
add the type `code` to abeTags

### src/cli/cms/data/regex.js (recognize the new type)
The following regexes will recognize the new type
```
export let abePattern = ...
export let abeAsTagPattern = ...
```

### src/cli/cms/editor/handlebars/printInput.js (create the HTML partial for the editor)
We handle the type code in printInput:
```
  else if (params.type.indexOf('code') >= 0) res += createInputCode(attributes, inputClass, params)
```

and we create a new function to create the related partial:
```
export function createInputCode(attributes, inputClass, params) {
  let codeAttrMode = 'text/html'
  let codeAttrTheme = 'material'
  if(params.mode)
    codeAttrMode = params.mode
  if(params.theme)
    codeAttrTheme = params.theme

  return `<div class="parent-${params.type} parent-${params.key}" data-parent="${params.key}">
            <div class="code">
              <textarea style="display:none" class="form-abe form-code-display" ${attributes}></textarea>
              <textarea class="${inputClass} form-code" ${attributes} data-code-mode="${codeAttrMode}" data-code-theme="${codeAttrTheme}" rows="4">${params.value}</textarea>
              ${hint(params)}
            </div>
          </div>`
}

```

## CLIENT (create a js function to handle events or do particular actions on your type)
### src/server/public/abecms/scripts/modules/EditorInputs.js
We create a specific js and import it in this file:
```
import CodeText from '../utils/code-textarea'
```

Then in _inputElements we instantiate our new class when we encounter the type:

```
    // Creating codemirror instances for {{abe type="code" ...}}
    var codes = document.querySelectorAll('.code')
    if(typeof codes !== 'undefined' && codes !== null){
      Array.prototype.forEach.call(codes, (code) => {
        new CodeText(code)
      })
    }
```

### src/server/public/abecms/scripts/modules/EditorSave.js (Choose the way you serialize the data on save)
in serializeForm, I need not to parse the value entered by the user as json:
```
} else if (
            input.value.indexOf('{') > -1 &&
            !input.classList.contains('form-code') &&
            !input.classList.contains('form-code-display')
          ) {
            value = JSON.parse(input.value)
        } else {
```

### src/server/public/abecms/scripts/modules/EditorUtils.js (choose how you update the page in the iFrame)
We need to adapt the way we update the page in the iFrame because:
```
case 'textarea':
  if(node.nodeType === 8){
    var commentPattern = new RegExp('(<!--' + node.data + '-->[\\s\\S]+?\\/ABE--->)')
    var res = commentPattern.exec(node.parentNode.innerHTML)
    var repl = node.parentNode.innerHTML
    var newStr
    if((input.classList.contains('form-rich'))){
      newStr = '<!--' + node.data + '-->' + input.parentNode.querySelector('[contenteditable]').innerHTML + '<!--/ABE--->'
      repl = repl.replace(res[0], newStr)
    } else if((input.classList.contains('form-code'))){
      // In the case of a {{abe type="code" ...}}, I have to check if the html is well formed
      // (it will crash if there is an unclosed tag)
      // If there is an unclosed tag, I close it
      var divTemp = document.createElement('div')
      divTemp.innerHTML = newStr
      if(divTemp.innerHTML == newStr || divTemp.innerHTML.slice(-8) === '/ABE--->'){
        repl = repl.replace(res[0], newStr)
      } else if(divTemp.innerHTML.indexOf('/ABE--->') > -1){
        var pos = divTemp.innerHTML.indexOf('/ABE--->')+8
        var len = divTemp.innerHTML.length
        var tag = divTemp.innerHTML.slice(pos - len)
        newStr = newStr.slice(0, newStr.length - 12) + tag +'<!--/ABE--->'
        repl = repl.replace(res[0], newStr)
      }
    } else {
      newStr = '<!--' + node.data + '-->' + val + '<!--/ABE--->'
      repl = repl.replace(res[0], newStr)
    }

    node.parentNode.innerHTML = repl
  }
```

### src/server/views/template-engine.html (additional js libraries, css ?)
adding related css and js (as this new type uses codemirror, I need the codemirror libraries)
```
<link rel="stylesheet" href="http://codemirror.net/lib/codemirror.css">
<link rel="stylesheet" href="http://codemirror.net/theme/material.css">
<script src="http://codemirror.net/lib/codemirror.js"></script>
<script src="http://codemirror.net/addon/search/searchcursor.js"></script>
<script src="http://codemirror.net/addon/search/search.js"></script>
<script src="http://codemirror.net/addon/dialog/dialog.js"></script>
<script src="http://codemirror.net/addon/edit/matchbrackets.js"></script>
<script src="http://codemirror.net/addon/edit/closebrackets.js"></script>
<script src="http://codemirror.net/addon/comment/comment.js"></script>
<script src="http://codemirror.net/addon/wrap/hardwrap.js"></script>
<script src="http://codemirror.net/addon/fold/foldcode.js"></script>
<script src="http://codemirror.net/addon/fold/brace-fold.js"></script>
<script src="http://codemirror.net/keymap/sublime.js"></script>
<script src="http://codemirror.net/mode/javascript/javascript.js"></script>
<script type="text/javascript" src="/abecms/libs/less.min.js"></script>
<script type="text/javascript" src="/abecms/libs/sass.js"></script>
<script type="text/javascript">
  Sass.setWorkerUrl('/abecms/libs/sass.worker.js');
  var sass = new Sass();
</script>
```

# Plugin development
You may choose to create a plugin adding an abe type. To do that, you'll have to:
## choose the id of your abe tag type
In this example, we create a 'code' type.

Create an abe.json file in the root of your plugin with this content:
```
{
  "abeTags":{
    "grg": "grg"
  }
}
```

You can develop your plugin as a script (in the scripts directory). Abe don't import abe.json config files from a script. During development, you'll have to put this config direcly in the abe.json of your project. Don't forget to put this config in the abe.json of your plugin when you'll publish your plugin.

Once you've created this config, Abe will now take your new type into account when parsing the templates.

> CAUTION: You'll never be able to add existing attributes in your abe.json plugin. If Abe finds an existing attribute in the abe.json of the user's project, it won't replace it with your value. If you want the user to change a value in her config, you'll have to document it.

## Create the html snippet associated to your type
Create a hooks.js file in your plugin, under the hooks directory (/hooks/hooks.js):

```
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
```

You'll listen to the afterEditorInput event. if you find the type, you create the desired snippet.

See the classes used in the textarea tags:
- form-abe: This triggers the Abe parsing.
- abe-format-html: This class makes Abe to try rendering the content keyed by the user as html (it will try to reformat the content to make it a regular html content)
- abe-keep-format: When you'll save the content keyed by the user, we won't try to parse the content as json but we'll jsut take the value.

## Your code client side
Now that you have created your new type, you may want to add js or css files to the editor.
You can add css and js by creating a partials directory.
In this directory, create a head.html if you want to add stylesheets or js before the </head> closing tag.
Create a body.html file if you want to add js before the </body> closing tag.

```
<link rel="stylesheet" href="http://codemirror.net/lib/codemirror.css">
<link rel="stylesheet" href="http://codemirror.net/theme/material.css">
<script src="http://codemirror.net/lib/codemirror.js"></script>
<script src="http://codemirror.net/addon/search/searchcursor.js"></script>
<script src="http://codemirror.net/addon/search/search.js"></script>
<script src="http://codemirror.net/addon/dialog/dialog.js"></script>
<script src="http://codemirror.net/addon/edit/matchbrackets.js"></script>
<script src="http://codemirror.net/addon/edit/closebrackets.js"></script>
<script src="http://codemirror.net/addon/comment/comment.js"></script>
<script src="http://codemirror.net/addon/wrap/hardwrap.js"></script>
<script src="http://codemirror.net/addon/fold/foldcode.js"></script>
<script src="http://codemirror.net/addon/fold/brace-fold.js"></script>
<script src="http://codemirror.net/keymap/sublime.js"></script>
<script src="http://codemirror.net/mode/javascript/javascript.js"></script>
<script type="text/javascript" src="/less.min.js"></script>
<script type="text/javascript" src="/sass.js"></script>
<script type="text/javascript">
  Sass.setWorkerUrl('/sass.worker.js');
  var sass = new Sass();
</script>
<script type="text/javascript" src="/code-textarea.js"></script>
<script type="text/javascript">
  document.addEventListener("DOMContentLoaded", function(event) {
    var codes = document.querySelectorAll('.code')
    if(typeof codes !== 'undefined' && codes !== null){
      Array.prototype.forEach.call(codes, (code) => {
        new CodeTextarea(code)
      })
    }
  });
</script>
```

## Conclusion
Once you have created and tested your plugin, you can now publish it. Congratz !

