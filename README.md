> **The version 3 is here ! See the [release notes](./version3.md)**
_______________

[![Develop Branch Build Status](https://travis-ci.org/abecms/abecms.svg)](https://travis-ci.org/abecms/abecms)
[![Build status](https://ci.appveyor.com/api/projects/status/o22xl2y3tc2javh2/branch/master?svg=true)](https://ci.appveyor.com/project/gregorybesson/abecms-d118d/branch/master)
[![Scrutinizer Quality Score](https://scrutinizer-ci.com/g/abecms/abecms/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/abecms/abecms/)
[![Package Quality](http://npm.packagequality.com/shield/abecms.svg)](http://packagequality.com/#?package=abecms)
[![Coverage Status](https://coveralls.io/repos/github/abecms/abecms/badge.svg?branch=master)](https://coveralls.io/github/abecms/abecms?branch=master)
[![Dependency Status](https://www.versioneye.com/user/projects/587a81915450ea0034dffa93/badge.svg?style=flat-square)](https://www.versioneye.com/user/projects/587a81915450ea0034dffa93)
[![Latest Stable Version](https://img.shields.io/npm/v/abecms.svg)](https://www.npmjs.com/package/abecms)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/abecms/abecms/master/LICENSE)
[![Total Downloads](https://img.shields.io/npm/dt/abecms.svg)](https://www.npmjs.com/package/abecms)
[![Twitter Follow](https://img.shields.io/twitter/follow/abe_cms.svg?style=social)](https://twitter.com/abe_cms)

# AbeCMS

[![Greenkeeper badge](https://badges.greenkeeper.io/abecms/abecms.svg)](https://greenkeeper.io/)

> AbeCMS is your __static websites generator__ with revolutionary __self-descriptive__ templates

When creating blogs becomes as easy as 1-2-3. A static site generator with a great back-office for users.

For agencies: Go 7X faster than with Wordpress or Drupal to create websites and blogs
For devs: A js full stack dev for js full stack devs with extensibility and efficiency in mind

- Markup your html templates with specific handlebars tags, and your back-office is ready to go: It's time to contribute for your users!
- Add a complete workflow of validation and permissions with ease, using the state of the art oAuth2 stack.
- Deploy automagically to AWS S3, Github.io, or any web server via SFTP
- Create multi-languages, multi-locales, complex web structures in no time
- Add plugins like abe-algolia, abe-elasticsearch... or create your own with just js skill

![From template abification to publication example](/tests/demo/site/images/abeCMS-demo.gif)

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

# Some sites built with AbeCMS
If you want us to add your sites, submit a PR of this README.

- accorhotels.com magazine (multi-languages, many contributors): http://www.accorhotels.com/fr/france/magazine/index.shtml
- Gemo storelocators: http://www.gemo-shop.be/, http://www.gemo.tn/, http://www.gemo.gp/, http://www.gemo.ma/, http://www.gemo.gf/, http://www.gemo.mq/, http://www.gemo.re/
- https://onadates.com/
- Hautes Pyrenées: http://neige.hautes-pyrenees.fr/
- Lourdes Pireneje: http://lourdes-pireneje.pl/
- blablacar: https://www.blablacar.fr/offre/voitures/
- Sofitel destinations: http://www.sofitel.com/fr/destinations/index.shtml
- Château d'Angles: http://www.chateaudangles.com/en/index.html
- Thai Kitchen: https://www.thaikitchen.fr
- Askja: http://www.askja-audio.com/
- eNewsletters Novotel (become a member to see the newsletters ;)
- eNewsletters Accor Club (become a member to see the newsletters ;)
- http://www.mariderm.com/
- http://www.peauologie.com/
- http://paysagementbelisle.com/
- ...

# Recipes, plugins, blogs
We have created recipes which are how-to's on specific subjects. If you wan't us to add your recipes, just send us a PR of this README:

## Recipes
- Recipe abemail: https://github.com/abecms/recipe-abemail
- Recipe Googlemaps: https://github.com/abecms/recipe-googlemaps
- Recipe abedynamicblocks: https://github.com/abecms/recipe-abedynamicblocks
- Recipe elacticsearch:https://github.com/abecms/recipe-elasticsearch
- Recipe PM2: https://github.com/abecms/recipe-pm2
- Recipe abe types: https://github.com/abecms/recipe-abetypes
- Recipe abe data: https://github.com/abecms/recipe-abedata1

## Plugins
- **Sublime editor snippets**: https://github.com/wonknu/abe-sublime-snippets
- **Vim Intellij snippets**: https://github.com/GG31/abecms-plugin-for-vim-intellij
- abe-deployer-sftp: https://github.com/abecms/abe-deployer-sftp
- abe-deployer-git: https://github.com/abecms/abe-deployer-git
- abe-deployer-s3: https://github.com/abecms/abe-deployer-s3
- abe-sitemap: https://github.com/abecms/abe-sitemap
- abe-algolia: https://github.com/abecms/abe-algolia
- abe-elasticsearch: https://github.com/abecms/abe-elasticsearch
- abe-packagz: https://github.com/abecms/abe-packagz
- abe-calendar: https://github.com/abecms/abe-calendar

## blogs
- An article on AbeCMS usage (in FR): http://www.disko.fr/reflexions/technique/abecms/
- A video introduction to AbeCMS by a HackReactor student: https://www.youtube.com/watch?v=J8zQ1s6jAdQ

# Demo
Deploy your own Abe demo on Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/abecms/demo)

# Getting started

## Install

```$ npm install -g abecms ```

## Usage
1. `abe init` : It launches a wizard to help you create your website
2. `cd my-website`
3. `abe serve -i` : launch your website (by default on port 3000)

See the documentation below for details

# Complete documentation

## First steps

- [First steps with AbeCMS](first-steps.md)

## Template designer references

- [abe tags template integration](docs/abe-tags.md)
- [abe attributes](docs/abe-attributes.md)
- [abe handlebars variables](docs/abe-handlebars-variables.md)
- [abe handlebars helpers](docs/abe-handlebars-helpers.md)

## Template cms admin

- [abe users management](docs/abe-users.md)
- [abe route list](docs/abe-url.md)
- [abe config json](docs/abe-config.md)

## Template plugin developer

- [abe plugin install](docs/abe-plugins.md)
- [abe plugin hook list](docs/abe-hooks.md)
- [abe attributes](docs/abe-attributes.md)


## Support / Contributing
coming soon

# Roadmap
See the complete [roadmap](./ROADMAP.md)
