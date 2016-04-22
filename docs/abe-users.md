# Abe user role / actions / workflow

> manage user roles to allow only some user to do some actions

###Default user

By default abe only have one user, admin user that have full right over Abe

Inside /abe/src/cli/config/abe-config.js there are two important things to manage users & actions

- A list of actions : ```actions: ['read', 'write', 'publish', 'unpublish', 'delete', 'config']```
- A list of roles : &nbsp;&nbsp;&nbsp;```roles: {admin: {'actions': '*'}}```

Actions are all allowed to admin user, this is why it has a star for actions properties ```{'actions': '*'}```

###Adding new user with restricted rights

Create a file __abe.json__ inside the root folder of your website (this file is merged with abe default config file, you can merge OR override anything from the default config with it)

```
{
  "roles": {
    "contributor": {
      "actions": ["read", "write"]
    }
  }
}
```

This will create a new type of role named __contributor__ that have the right to read and write.

###How does it works ?

Inside /abe/src/server/views/template-engine.html which is redered server side with HandlebarsJS templating engine there are {{#if}} statements that disable some features if the user has no right to use them.

For example :

contributor cannot __publish__ page, here is the code inside template-engine.html

```
{{#if @root.allowedActions.publish}}
  <button class='btn btn-default btn-save' data-action="publish">
    ...
  </button>
{{/if}}
```
This means HandlebarsJS won't render this button and publish actions won't be possible for this user.

###Adding new actions

Just like roles, to add new actions just add __actions__ array inside abe.json

```
{
  "actions": ["custom"],
  "roles": {
    "contributor": {
      "actions": ["read", "write"]
    }
  }
}
```

This can be useful combined with Abe plugins etc ...

###Creating a workflow

Inside __abe.json__ create a property __workflow__ which is an array containing workflows like this

```
"workflow": ["review", "validate", "..."]
```
This will add new step to the page creation process

###User & workflow

To restrict workflow step to some user, just add or not those actions step to their actions array to allow/disallow them to use them.
For example :

```
{
  "actions": ["validate"],
  "roles": {
    "user_1": {
      "actions": ["read", "write"]
    },
    "user_2": {
      "actions": ["read", "validate"]
    }
  }
}
```
Only user_2 will be able to send a page to validation step

###Secure cookies

Inside abe.json

```json
  "cookie": {
    "secure": false
  },
```