[![Develop Branch Build Status](https://travis-ci.org/abecms/abecms.svg)](https://travis-ci.org/abecms/abecms)
[![Build status](https://ci.appveyor.com/api/projects/status/o22xl2y3tc2javh2/branch/master?svg=true)](https://ci.appveyor.com/project/gregorybesson/abecms-d118d/branch/master)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/abecms/abecms/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/abecms/abecms/)
[![Coverage Status](https://coveralls.io/repos/github/abecms/abecms/badge.svg?branch=master)](https://coveralls.io/github/abecms/abecms?branch=master)
[![Dependency Status](https://www.versioneye.com/user/projects/587a81915450ea0034dffa93/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/587a81915450ea0034dffa93)
[![Latest Stable Version](https://img.shields.io/npm/v/abecms.svg)](https://www.npmjs.com/package/abecms)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/abecms/abecms/master/LICENSE)
[![Total Downloads](https://img.shields.io/npm/dt/abecms.svg)](https://www.npmjs.com/package/abecms)
[![Twitter Follow](https://img.shields.io/twitter/follow/abe_cms.svg?style=social)](https://twitter.com/abe_cms)

# AbeCMS
> AbeCMS is your __static websites generator__ with revolutionnary __self-descriptive__ templates

When creating blogs becomes as easy as 1-2-3. A static site generator with a great back-office for users.

For agencies: Go 7X faster than with Wordpress or Drupal to create websites and blogs
For devs: A js full stack dev for js full stack devs with extensibility and efficiency in mind

- Markup your html templates with specific handlebars tags, and your back-office is ready to go: It's time to contribute for your users!
- Add a complete workflow of validation and permissions with ease, using the state of the art oAuth2 stack.
- Deploy automagically to AWS S3, Github.io, or any web server via SFTP
- Create multi-languages, multi-locales, complex web structures in no time
- Add plugins like abe-algolia, abe-elasticsearch... or create your own with just js skill


# Goals
- Being the easiest CMS on the planet for the developpers by providing 1 clear api stack to rule them all and using a html markup usable by non-devs to create a full website:
  - Develop your HTML templates with hot reload and see changes in real time
  - Develop your plugins with hor reload and see also changes in real time
  - Directory-based URLs. Create directories and subdirectories in AbeCMS, the URL page will be expressed from its spot on the filesystem.
  - Focus on your HTML integration, dynamizing it becomes a breeze with AbeCMS
- Being the easiest CMS on the planet for the users by using hyper clean pages and A REAL wysiwyg editor fast and easy to use:
  - One Dashboard for your analytics
  - One Manager page for listing and searching all your posts
  - One editor with a REAL wysiwyg of your post
  - One page for managing your users and their authorizations
  - THAT'S ALL !
- Being content focused (the C in CMS):
  - Data are created as JSON documents
  - An API-first Server to serve your documents as json
  - Or a static website generator
  - Or both !

# Why use AbeCMS instead of other CMS or Static Site Generators ?
- Designed for users
- A real Wysiwyg Editor
- A real workflow and authorization engine based on oAuth2
- Auto-generation of the back-office editor based on your markup
- Live editing on each part of your site during development dramatically increasing the dev speed
- A strong separation of data and templates making the reuse of data a breeze
- A API-first REST server: You create html pages and can consume data for your mobile, emails or whatever

# Sites built with AbeCMS

# Recipes, plugins, videos and blogs
We have created recipes which are how-to's on specific subjects. If you wan't us to add your recipes, just send us a PR of this README:

# Demo
Deploy your own Abe demo on Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/abecms/demo)

# Getting started

With __npm__ : ```$ npm install -g abecms ```

## Unix and Mac Prerequisites

- nodejs
- git

## Windows Prerequisites

- Git Bash
- nodejs

## Abe command line tool

Create a website  ```$ abe create mysite ```
this create your __website structure__ that can be overridden with a json config file

Default project structure :

```
- mysite
 |_ data (contains your json documents)
 |_ site (contains published files, this is your static website)
 |_ structure (add as many folders and subfolders to create your website structure)
 |_ templates (put your templates here)
```

Launch abe engine 

```$ cd mysite ```

```$ abe serve ```

OR

start server with nodemon (dev)

```$ abe servedev ```

## Options

```
Usage: abe [command] {OPTIONS}

Standard Options:

   --port, -p <port> 	Use a specific port
   
   --interactive , -i   Open abe inside your browser (use with serve command)

```

## Usage

```
Usage: abe [command] {OPTIONS}

Standard Options:

--version, -v 	Output the version number

   --help, -h 	Show this message

```

## Creating abe template
List of self-descriptive Abe tag

- tag __text__ :

```
{{abe type='text' key='text_key' desc='give some tips' tab='default'}}
```
- tag __link__

```
<a href="{{abe type='link' key='link_key' desc='give some tips' title='html title' tab='default'}}">
	my link
</a>
```
- tag __image__

```
<img src="{{abe type='image' key='image_key' desc='give some tips' width='100' height='100' alt='html alt' tab='default'}}" />
```
- tag __textarea__

```
{{abe type='textarea' key='textarea_key' desc='give some tips' tab='default'}}
```
- tag __file__

```
{{abe type='file' filetype='file_type' key='file_key' desc='give some tips' tab='default'}}
```
- tag __rich__

```
{{abe type='rich' key='rich_key' desc='give some tips' tab='default'}}
```
- tag __data__

[doc abe meta](docs/abe-data.md)

- loop each (create content bloc) 

```
{{#each key_name}}
​	{{abe type='text' key='key_name.text_key' desc='give some tips' tab='default'}}
{{/each}}
```

## Template designer references

- [abe tags template integration](docs/abe-tags.md)
- [abe attributes](docs/abe-attributes.md)
- [abe handlebars variables](docs/abe-handlebars-variables.md)
- [abe handlebars helpers](docs/abe-handlebars-helpers.md)

## Template cms admin

- [abe users management](docs/abe-users.md)
- [abe route list](docs/abe-url.md)
- [abe config json](docs/abe-config.md)

## Template plugins developer

- [abe plugin install](docs/abe-plugins.md)
- [abe plugin hook list](docs/abe-hooks.md)
- [abe attributes](docs/abe-attributes.md)

More detailed documentation coming soon

## Adding a template and assets (css / js / images ...)

to add a template just paste it inside the /templates directory
```
- mysite
 |_ templates 
	|_ template.html
	|_ template_files
```

Assets must be in the same folder of your template and have the same name followed by `_files`

More detailed documentation coming soon

## user management

[doc abe user, custom actions & workflow](docs/abe-users.md)


## Custom Abe admin engine

[doc abe admin override](docs/abe-users.md)


## Abe command to build all pages

coming soon

## Support / Contributing

coming soon

## Build from source

### Windows User

- python (2.7.x)

Setup path to python

Open git bash then run

```shell
PATH=$PATH:/c/Python27/
npm config set python /C/Python27/
```

Install visual studio community edition

> [https://www.visualstudio.com/downloads/download-visual-studio-vs#d-express-windows-desktop](https://www.visualstudio.com/downloads/download-visual-studio-vs#d-express-windows-desktop)

install windows sdk

> [https://developer.microsoft.com/fr-fr/windows/downloads/windows-10-sdk](https://developer.microsoft.com/fr-fr/windows/downloads/windows-10-sdk)

Tell node-sass which version of 
Open git bash then run

```shell
# npm config set msvs_version [ VISUAL STUDIO VERSION ] --global
npm config set msvs_version 2015 --global
```

### Clone

Create a blog directory (ie. "abesite") with the default project structure (see below). It will contain your blog.
git clone abe outside of your blog directory (not in abesite) :

```$ git clone https://github.com/abecms/abecms.git ```

```$ cd abecms ```

```$ npm i ```

to launch your blog using Abe, under Linux or Mac, you have to set an Environment variable pointing to your blog :

```$ ROOT=/my_path_to_the_blog npm run startdev ```

# Roadmap
See the complete [roadmap](./ROADMAP.md)
