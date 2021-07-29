# Abe admin override

> Customize Abe engine.

## Override

Abe admin engine is in this [directory](src/server/views/partials) if you want to override one or multiple admin template, you need to override the path in your __abe.json__ config file.

Like this:

```json
"partials": "path/to/my/partialsOverride"
```

This path will be relative from your abe website, then just copy the html file from [here](src/server/views/partials) to your path to override the template and then customize them!

Inside the HTML file there are handlebarJS tag which can be combined with custom actions for custom users, see [doc abe user, custom actions & workflow](docs/abe-users.md).

For example if you have a custom action restricted to some user:

```json
{
    "actions": ["custom"],
    "roles": {
        "user_1": {
            "actions": ["read", "write"]
        },
        "user_2": {
            "actions": ["custom"]
        }
    }
}
```

And inside your html template override:

```html
{{#if @root.allowedActions.custom}}
  <a href="#">click me !</a>
{{/if}}
```

Only `user_2` will be able to see and click on this link.
