[![Develop Branch Build Status](https://travis-ci.org/abecms/abecms.svg)](https://travis-ci.org/abecms/abecms)
[![Build status](https://ci.appveyor.com/api/projects/status/o22xl2y3tc2javh2/branch/master?svg=true)](https://ci.appveyor.com/project/gregorybesson/abecms-d118d/branch/master)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/abecms/abecms/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/abecms/abecms/)
[![Coverage Status](https://coveralls.io/repos/github/abecms/abecms/badge.svg?branch=master)](https://coveralls.io/github/abecms/abecms?branch=master)
[![Dependency Status](https://www.versioneye.com/user/projects/587a81915450ea0034dffa93/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/587a81915450ea0034dffa93)
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

# Introduction
I've bet on Abe 18 months ago. I've designed and organized the first versions of Abe as a personal side project. Soon, I've been able to win a project including this technology with a big french company. We've then worked on this project (and new ones) based on AbeJS (its name at this time) with a sub-team of AdFab Connect, including Emmanuel Gonzalez, Fabrice Labbé, Nicolas Labbé, Olivier Pompilius. This project has been open sourced as a MIT licenced project since the beginning so that you can freely use Abe to create wonderful experiences in a snap and I decided to host this project on Adfab Connect's Github at this time.
I've decided to fork my own project to regain freedom on its future with no dependency to direct needs of customers. I will de velop this project in its own organization with your help. Feel free to send PR's.

# Roadmap
See the complete [roadmap](./ROADMAP.md)

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
