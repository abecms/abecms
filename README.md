# Abe, A better engine

> Abe is your __static websites generator__ with revolutionnary __self-descriptive__ templates

## Getting started

With __npm__ : ```$ npm install -g abe-cli ```

### For developpers
With __github__ :

Create a blog directory (ie. "abesite") with the default project structure (see below). It will contain your blog.
git clone abe outside of your blog directory (not in abesite) :

```$ git clone https://github.com/AdFabConnect/abe.git ```

```$ cd abe ```

to launch your blog using Abe, under Linux or Mac, you have to set an Environment variable pointing to your blog :

```$ ROOT=/my_path_to_the_blog npm run startdev ```

Under windows :

```$ set ROOT=/my_path_to_the_blog&&npm run startdev ```

Other environment variables are available (like PORT for defining a listening port for ABE and WEBPORT for your blog port)

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

start server with pm2 ([pm2](https://www.npmjs.com/package/pm2) must be installed globally)

```$ abe servepm2 ```


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
