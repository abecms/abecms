# First steps
## Unix and Mac Prerequisites

- nodejs
- git

## Windows Prerequisites

- Git Bash
- nodejs

## Abe command line tool

Create a website  ```$ abe init ```
this wizard helps you to create your __website structure__ that can be overridden with a json config file ```abe.json```

Default project structure :

```
- mysite
 |_ data (contains your json documents)
 |_ site (contains published files, this is your static website)
 |_ structure (add as many folders and subfolders to create your website structure)
 |_ themes/default/templates (put your templates here)
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
