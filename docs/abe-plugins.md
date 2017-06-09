# Abe plugins

Abe plugin system is based on npm modules: You can install a plugin which has been deployed on npm or resides on GitHub with a proper `package.json`.  
Furthermore, you can create your own scripts without having to register it in npm (see below).

# Install a plugin

Run:

```shell
abe install some-plugin-name
```

This will install the plugin in the `node_modules` directory and add a new entry inside `abe.json` file (it will create abe.json if it doesn't exist):

```json
{
    "plugins": [
        "some-plugin-name"
    ]
}
```

You can install a specific version of the plugin this way:

```shell
abe install some-plugin-name@1.0.0
```

This will install the plugin in the `node_modules` directory. The entry in `abe.json`:

```json
{
    "plugins": [
        "some-plugin-name@1.0.0"
    ]
}
```

You can also install a module hosted on GitHub. This is particularly useful for modules you don't want to make public and don't have a private npm repo.  
The syntax is abe install `user_or_org/repo#branch`.  
`user_or_org` being your user or organization GitHub ID, repo being the repo and branch being the branch or the tag.

Run:

```shell
abe install user_or_org/myrepo
```

This will install the plugin in the `node_modules` directory and add a new entry inside `abe.json` file (it will create `abe.json` if it doesn't exist):

```json
{
    "plugins": [
        "user_or_org/myrepo"
    ]
}
```

You can install a specific version of the plugin this way:

```shell
abe install user_or_org/myrepo#1.0.0
```

The entry in `abe.json`:

```json
{
    "plugins": [
        "user_or_org/myrepo#1.0.0"
    ]
}
```

# Install all plugins

Run:

```shell
abe install
```

This will fetch all plugins listed in `abe.json` and npm install the plugins.

# Use custom scripts

Custom scripts are created under `scripts` directory. Follow the same structure as for a plugin. 
Example for a module `abe-hint` under scripts:

Example from `abe-hint` plugins:

```
website/
  |_ scripts/
    |_ abe-hint/
      |_ hooks/
      |  - hooks.js
      |_ partials/
      | - some_partials.html ...
      | - some ...
      | - ...
      |_ routes/
        - my_route.js ...
```

This way, you'll be able to create custom scripts which you don't want to share between your different Abe projects. You can name your module as you want.

# Dev plugins

> How to create plugins.

Inside website (under scripts folder) create a directory with the name of your choice (this name will be the name of your plugin).

You can then add hooks or template override.

Example from `abe-hint` plugins:

```
website/
  |_ node_modules/
    |_ abe-hint/
      |_ hooks/
      |  - hooks.js
      |_ partials/
      | - some_partials.html ...
      | - some ...
      | - ...
      |_ routes/
        - my_route.js ...
```

Once you'll be satisfied with the way your module works, you'll then be able to create a regular npm module and install it on your project with the command Abe `install my_module`.

## Frontend javascript

Your partial can import css/js file.

You can register some event to alter Abe.

For example:

```
website/
  |_ node_modules/
    |_ my-plugin/
      |_ partials/
        - styles.html
        - my-scripts.js
```

Content of `styles.html`:

```html
<script src="/my-scripts.js"></script>
```

Content of `my-scripts.js`:

```javascript
abe.json.saving(function (e) {
    abe.json.data.someVariable = 'test'
})
```

`someVariable` will be saved into content JSON file, because the JSON was changed before saving.

## Add route

```
website/
  |_ node_modules/
    |_ my-plugin/
      |_ routes/
        - my_route.js ...
```

You now get a new route at `http://localhost:8000/plugin/my-plugin/my_route` (this is created fron plugin name `my-plugin` and `my_route.js`.

Example file:

```javascript
'use strict';

var route = function route(req, res, abe) {
    res.set('Content-Type', 'application/json')
    res.send(JSON.stringify({
        route: 'search',
        success: 1
    }))
}

exports.default = route;
```
