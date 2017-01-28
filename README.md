[![Develop Branch Build Status](https://travis-ci.org/abecms/abecms.svg)](https://travis-ci.org/abecms/abecms)
[![Build status](https://ci.appveyor.com/api/projects/status/o22xl2y3tc2javh2/branch/master?svg=true)](https://ci.appveyor.com/project/gregorybesson/abecms-d118d/branch/master)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/abecms/abecms/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/abecms/abecms/)
[![Coverage Status](https://coveralls.io/repos/github/abecms/abecms/badge.svg?branch=master)](https://coveralls.io/github/abecms/abecms?branch=master)
[![Dependency Status](https://www.versioneye.com/user/projects/587a81915450ea0034dffa93/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/57ea4badbd6fa600316f9f6c)
[![Inline docs](http://inch-ci.org/github/abecms/abecms.svg?branch=master)](http://inch-ci.org/github/abecms/abecms)
[![Latest Stable Version](https://img.shields.io/npm/v/abecms.svg)](https://www.npmjs.com/package/abecms)
[![Total Downloads](https://img.shields.io/npm/dt/abecms.svg)](https://www.npmjs.com/package/abecms)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/abecms/abecms/master/LICENSE)
# Abe, A better engine

> Abe is your __static websites generator__ with revolutionnary __self-descriptive__ templates

[![NPM](https://nodei.co/npm/abecms.png?downloads=true&downloadRank=true)](https://nodei.co/npm/abecms/)
[![NPM](https://nodei.co/npm-dl/abecms.png?months=3&height=3)](https://nodei.co/npm/abecms/)

# Demo
Deploy your own Abe demo on Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/abecms/demo)

# Presentation
I've designed this CMS because I wanted to simplify and optimize the way we're creating content. Wordpress is way too complex for what it does. Welcome to ABE (A Better Engine) : This CMS will make you create content in a snap and publish it on the web in no time !

# Contributing
We've bet on Abe 1 year ago, investing more than 100 000,00EUR in this project. We have decided to open source it so that our customers and you can freely use Abe to create wonderful experiences in a snap !

We will maintain Abe for the next 3 years and have a dedicated 20% Full Time Equivalent developer on it. We need you to improve Abe, feel free to join us and submit PR's !

# Roadmap
We have a 1 year roadmap (estimation) with the following versions. You'll notice that as we're developing in agile mode, we've chosen to create and present groups of features but no date of delivery (feature-driven release planning : http://www.scrum-institute.org/Release_Planning.php). This roadmap doesn't take into account the bugs which could be opened during this timeframe. Depending on the severity of these bugs, we'll be able to fix shortly after their discovery and include those fixes in specific Hotfix versions or include these bugs in the roadmap.

The 2.x releases will focus on quality and stability and will be covered by Unit tests + functional tests.
The separation between the engine, the API server and the front will be reinforced by putting each part in its own repository
The documentation will be rewritten and included in the modules
As a major new feature, it will be possible to create a template from partials.

## Roadmap of the next 2.x releases
- the stateful manager of Abe has to become responsible of pagination of articles (huge performance boost)
- A homepage will arrive (at last !) on the frontend
- It will be possible to create filtered views on the manager frontend
- Refactoring the editor has to be done
- The load testing scenarii will be open sourced (based on Locust)
- Precompiling of templates has to be fully tested
- since Abe has become stateful, clustering has been removed. Implement a solution to permit clusters of Abe
- Add template creation from partials
- Structure will be editable from abe, as references
- templates and partials will be uploadable
- Video training will be produced

## Roadmap of the 3.x releases
- Separate the engine, the REST server and the client
- rewrite the client in react
- create an Electron version
- More to come !

## Changelog
See the complete [changelog](./CHANGELOG.md)

### 2.11.*
- Abe type="import": Can now include variables
- Abe admin: Role Workflow management has been improved
- Functional tests are now available !
- Unit testing covers more than 60% of the code :)

### 2.10.*
- Template designer : isEditor variable can be used in a template
- Bugfixes

### 2.9.*
- Only bugfixes concerning User management

### 2.8.*
- New plugin system for Abe. It's now based on npm !
- Integrating user authentication and authorization Management inside Abe !
- Integrating Image cropping and resizing into Abe !
- Improving Unit tests

### 2.7.*
- New statement in Abe type="data": the display attribute can contain multiple variables (useful when used with autocomplete feature)

### 2.6.*
- Template designer: Precontrib is available for template designers. It will be possible to define specific slug structure from a template.
- Template designer: 2 new handlebars helpers. uppercase and lowercase
- Reference files editor available on admin !
- Manager: On publish and unpublish, we only add/update or remove the concerned file. Huge performance improvement on save steps !
- Dev: It's now possible to dev Abe under Windows

### 2.5.*
- New statement in Abe type="data" AQL format: A select may now contain "IN" or "NOT IN" with variables usage (you can reference another data type).
- New attribute in Abe type="data": prefill gives the possibility on the editor to "refill" fields already filled in.
- Adding unit tests
- New command: generate-posts.js giving you the possibility to export data from Abe on the command line
- The Abe editor is now compatible with Firefox

### 2.4.*
- The first unit tests are implemented
- Quality control with esLint added
- Continuous Integration with [Travis](https://travis-ci.org/abecms/abecms)
- Unit test coverage added : [coveralls](https://coveralls.io/github/abecms/abecms?branch=master)
- Select data become a first class citizen in Manager => perf X50 on page display including templates with select statements

### 2.3.*
- don't block response when upload image file size reaches a predefined limit
- allow video upload
- New handlebars helper : isTrue() (cf. doc)
- Replacing `Sql.deep_value_array` with `eval` in abe-sql.js resulting in a performance boost on request calculation
- precompilation of templates added as configurable option resulting in a performance boost on page display
- Removing pagination option from Abe

### 2.2.*
- ExecuteQuery becomes asynchronous

### 2.1
- New handlebars helper : truncate() (cf. doc)

### 2.0
- The plugins have been put in their respective repository. It's now possible to install plugins directly from Abe config file and command `abe install`.
- Abe becomes a stateful app. A manager is created to handle the file list which is updated on events (CRUD) resulting in a major boost of performance.

### 1.8.x
This version will be the last in the 1.x series.
- Performance improvements: The overall performance of Abe has been optimized. The "Order By" statement in select statement ine the type="data" has been deeply improved. Furthermore, the front was requesting twice the same content (to populate left and main content). It has been fixed. 

### 1.7.x
New features :
- Duplicate : It's now possible to create a new content form an existing one.
- Routes refactoring : Each action sent to the Abe engine has its own route
- Routes refactoring : A new route /list-url display the whole list of available routes exposed by Abe
- Routes refactoring : publish-all is a new route triggering the republication of all already published content without modifying the modification date oif these contents. This is the first attempt to address the possibility of updating linked content when publishing a content.
- Content metadata updatable : It's now possible to change the path, the name or the template of an existing file
- Debugging : It's now possible to trigger logs by adding a parameter in the url

# Getting started

With __npm__ : ```$ npm install -g abecms ```

## Unix

- nodejs
- git

## Windows

- Git Bash
- nodejs

## Abe command line tool

Create website a  ```$ abe create mysite ```
this create your __website structure__ that can be overridden with a json config file

Default project structure :

```
- mysite
 |_ data (contains json data)
 |_ draft (contains file saved as draft)
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

> default config


## Options

```
Usage: abe [commande] {OPTIONS}

Standard Options:

   --port, -p <port> 	Use a specific port
   
   --interactive , -i   Open abe inside browser (use with serve command)

```

## Usage

```
Usage: abe [commande] {OPTIONS}

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

More detailled documentation comming soon

## Adding a template and assets (css / js / images ...)

to add a template just paste it inside of templates directory

```
- mysite
 |_ templates 
	|_ template.html
	|_ template_files
```

Assets must be in the same folder of your project and have the same name followed by `_files`

More detailled documentation comming soon

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

=======
# abe-test-plugin
