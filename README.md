[![Develop Branch Build Status](https://travis-ci.org/AdFabConnect/abejs.svg)](https://travis-ci.org/AdFabConnect/abejs)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/AdFabConnect/abejs/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/AdFabConnect/abejs/)
[![Coverage Status](https://coveralls.io/github/AdFabConnect/abejs/badge.svg?branch=master&service=github)](https://coveralls.io/github/AdFabConnect/abejs?branch=master)
[![Dependency Status](https://www.versioneye.com/user/projects/57ea4badbd6fa600316f9f6c/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/57ea4badbd6fa600316f9f6c)
[![Latest Stable Version](https://img.shields.io/npm/v/abe-cli.svg)](https://www.npmjs.com/package/abe-cli)
[![Total Downloads](https://img.shields.io/npm/dt/abe-cli.svg)](https://www.npmjs.com/package/abe-cli)
[![license](https://img.shields.io/github/AdFabConnect/abejs/apistatus.svg?maxAge=2592000)]()
# Abe, A better engine

> Abe is your __static websites generator__ with revolutionnary __self-descriptive__ templates



# Contributing
We've bet on Abe 1 year ago, investing more than 100 000,00EUR in this project. We have decided to open source it so that our customers and you can freely use Abe to create wonderful experiences in a snap !

We will maintain Abe for the next 3 years and have a dedicated 20% Full Time Equivalent developer on it. We need you to improve Abe, feel free to join us and submit PR's !

# Roadmap
We have a 1 year roadmap (estimation) with the following versions. You'll notice that as we're developing in agile mode, we've chosen to create and present groups of features but no date of delivery (feature-driven release planning : http://www.scrum-institute.org/Release_Planning.php). This roadmap doesn't take into account the bugs which could be opened during this timeframe. Depending on the severity of these bugs, we'll be able to fix shortly after their discovery and include those fixes in specific Hotfix versions or include these bugs in the roadmap.

## Last versions
#### 1.7.x

New features :
- Duplicate : It's now possible to create a new content form an existing one.
- Routes refactoring : Each action sent to the Abe engine has its own route
- Routes refactoring : A new route /list-url display the whole list of available routes exposed by Abe
- Routes refactoring : publish-all is a new route triggering the republication of all already published content without modifying the modification date oif these contents. This is the first attempt to address the possibility of updating linked content when publishing a content.
- Content metadata updatable : It's now possible to change the path, the name or the template of an existing file
- Debugging : It's now possible to trigger logs by adding a parameter in the url

#### 1.8.x
This version will be the last in the 1.x series.
- Performance improvements: The overall performance of Abe has been optimized. The "Order By" statement in select statement ine the type="data" has been deeply improved. Furthermore, the front was requesting twice the same content (to populate left and main content). It has been fixed. 

## Roadmap 2016
#### 2.x planned beginning of 2017
This major release will focus on quality and stability and will be covered by Unit tests + functional tests.
The separation between the engine, the API server and the front will be reinforced by putting each part in its own repository
The documentation will be rewritten and included in the modules
The plugins already written will be put in their respective repository
As a major feature, it will be possible to create a template from partials.

# Getting started

With __npm__ : ```$ npm install -g abe-cli ```

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

OR

start server with pm2

open ./abe.json

```
{
  "processName": "abe",
  "port": "8000"
}

```
> default config


```$ abe prod ```

to stop pm2 in production

```$ abe stop ```


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

--version, -V 	Output the version number

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

```$ git clone https://github.com/AdFabConnect/abejs.git ```

```$ cd abejs ```

```$ npm i ```

to launch your blog using Abe, under Linux or Mac, you have to set an Environment variable pointing to your blog :

```$ ROOT=/my_path_to_the_blog npm run startdev ```

Other environment variables are available (like PORT for defining a listening port for ABE and WEBPORT for your blog port)

=======
# abe-test-plugin
