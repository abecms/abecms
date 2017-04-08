# First steps
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
