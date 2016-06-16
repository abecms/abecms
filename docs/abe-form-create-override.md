# Override default form create file

create a folder name "custom"

and create a new file named "create.html"

> info : https://github.com/AdFabConnect/abejs/blob/master/dist/server/views/partials/create.html

if you add the form attributes ```data-form-abe-create="true"``` default abejs javascript file will perform action on your custom form

# create a new file

## Save
Ajax call (GET)

> /abe/create/?tplName=my-file-name&filePath=some/folder/path&selectTemplate=template-name.html

mandatory parameters:
- tplName: name of the file
- filePath: path where the file will be created
- selectTemplate: name of the template used

Optionnal:
you can add many parameter and use beforeSave hook to perform action

#Redirect

When the request is done and the status code ```"success": 1``` redirect

```javascript
var jsonRes = JSON.parse(response);
if (jsonRes.success == 1 && typeof jsonRes.json.abe_meta !== 'undefined' && jsonRes.json.abe_meta !== null) {
	window.location.href = window.location.origin + '/abe/' + jsonRes.json.abe_meta.template + '?filePath=' + jsonRes.json.abe_meta.link
}else {
	alert('error')
}
```

## Duplicate

Same as create

> /abe/duplicate/

mandatory parameters:
- tplName: name of the file
- filePath: path where the file will be created
- selectTemplate: name of the template used
- oldFilePath: file to copy
