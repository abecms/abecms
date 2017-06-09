# Update JSON

Can be used to update JSON file (with a specific hook).

## How to use

> Inside `hooks/hooks.js`

```javascript
var hooks = {
    beforeUpdateJson: function (jsonFilesArray, abe) {
        // jsonFilesArray = array of json object containing references to json data files (abe data)
        var index = jsonFilesArray.length;
        jsonFilesArray.forEach(function (file) {
            var json = abe.FileParser.getJson(file.path); // Open json data
            // For exemple update / add / delete json values
            abe.saveJson(file.path, json) // then save the json again
        });

        return jsonFilesArray
    }
};
```
