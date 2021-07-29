# Type _template_

> Type template allows you to manage the way templates are handled in AbeCMS.

## Example

Inside **template** folder open any template and add:

```html
{{abe type="template" auto-create="true" editable="false"}}
{{abe type="slug" source="index"}}
```

- `editable="false"`: This will hide the template in the dropdown list of the launcher
- `auto-create="true"`: This will create a data file `index-abe-xxx.json` in the data directory
