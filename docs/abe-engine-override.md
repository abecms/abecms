# Abe admin override

> Customize abe engine

###Override

Abe admin engine is in this [directory](src/server/views/partials) if you want to override one or multiple admin template, you need to override the path in your __abe.json__ config file.

like this :

```
"partials": "path/to/my/partialsOverride"
```

this path will be relative from your abe website, then just copy the html file from [here](src/server/views/partials) to your path to override the template and then customize them !

inside the html file there are handlebarJS tag which can be combined with custom actions for custom users, see [doc abe user, custom actions & workflow](docs/abe-users.md)

for example if you have a custom action restricted to some user :

```
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

and inside your html template override :

```
{{#if @root.allowedActions.custom}}
  <a href="#">click me !</a>
{{/if}}
```

only user_2 will be able to see and click on this link