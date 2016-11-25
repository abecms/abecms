# Abe handlebars helpers

> Is user authorized for an action

### Example

if user authorized to call url `/abe/deleteAll` show button delete

{{#isAuthorized '/abe/deleteAll' @root.user.role.workflow}}
<div>
  I can delete everything !
</div>
{{/isAuthorized}}

### Example of config into abe.json

```json
{
  "users": {
    "roles": [
      {
        "workflow":"CustomUser",
        "name":"CustomUser"
      }
      {
        "workflow":"admin",
        "name":"Admin"
      }
    ],
    "routes": {
      "admin": [],
      "CustomUser": [
        "\/abe\/deleteAll.*"
      ],
```

Because **CustomUser** has an entry with `\/abe\/deleteAll.*` he would not be allowed to call