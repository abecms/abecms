# Abe hooks

> How to create hooks

Inside website (create hooks folders) then hook.js file

Example from abe-hint plugins

```javascript
'use strict';

var hooks = {
	afterAbeAttributes: function afterAbeAttributes(obj, str, json, abe) {
		obj.hint = abe.getAttr(str, 'hint')
		return obj
	},
	afterEditorInput: function afterEditorInput(htmlString, params, abe) {
		if(typeof params.hint !== 'undefined' && params.hint !== null && params.hint !== '') {
			htmlString = htmlString + '<span class="abe-hint help-block"><span class="glyphicon glyphicon-info-sign"></span>' + params.hint + '</span>'
		}

		return htmlString;
	}
};

exports.default = hooks;
```

##Available hooks

Function | params | description
--- | --- | --- |
beforeSave | (obj, abe) | Change data **before** it's written on file system
afterSave | (obj, abe) | Change data **after** it's written on file system
beforeEditorInput | (params, abe) | Change params before admin form is made
afterEditorInput | (htmlString, params, abe) | Change html before admin form is rendered
beforeAbeAttributes | (str, json, abe) | Change abe tag string before get attributes
afterAbeAttributes | (obj, str, json, abe) | Add attribute to abe tag
beforeEditorFormBlocks | (json, abe) | add Tab and Input to abe admin
afterEditorFormBlocks | (blocks, json, abe) | add Tab and Input to abe admin
beforeGetJson | (path, abe) | change json path before it load
afterGetJson | (json, abe) | change json data after load
beforeGetTemplate | (file, abe) | change html template path
afterGetTemplate | (text, abe) | change text of template
beforePageJson | (json, abe) | change json before page render
beforeAddWorkflow | (flows, userFlow, currentFlow, text, abe) | Allow to add stuff **before** to the toolbar
afterAddWorkflow | (flows, userFlow, currentFlow, text, abe) |  Allow to add stuff **after** to the toolbar
beforeListPage | (file, workflow, index, action, text, abe) | Call **before** each row is created on table list
afterListPage | (res, file, workflow, index, action, text, abe) | Call **before** each row is created on table list, **res** equal the html of the row