#!/usr/bin/env node
import {Promise} from 'bluebird'
import Create from './cli/cms/Create'
import plugins from './cli/extend/plugins'
import {exec} from 'child_process'
import {spawn} from 'child_process'
import execPromise from 'child-process-promise'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'
import path from 'path'
import program from 'commander'
import pkg from '../package'
import pm2 from 'pm2'
import clc from 'cli-color'

program
  .version(pkg.version)
  .option('-v, --version', 'version')
  // .parse(process.argv)

program
  .command('generate-posts')
  .alias('gp')
  .description('save post to file with type from folder')
  .option('-t, --type [type]', 'posts status draft|other')
  .option('-t, --path [path]', 'path /relative/path')
  .option('-d, --destination [destination]', 'folder to save result')
  .action(function(options){
    var dir = process.cwd()
    if(process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }
    process.env.DEBUG = 'generate-posts:*'
    var generateArgs = ['--harmony', __dirname + '/cli/process/generate-posts.js', 'ABE_WEBSITE=' + dir]
    if(options.destination != null) {
      generateArgs.push('ABE_DESTINATION=' + options.destination)
    }
    if(options.path != null) {
      generateArgs.push('ABE_PATH=' + options.path)
    }
    if(options.type != null) {
      generateArgs.push('ABE_STATUS=' + options.type)
    }

    var generate
    if (__dirname.indexOf('dist') > -1) {
      generate = spawn('node', generateArgs, { shell: true, stdio: 'inherit' })
    }else {
      generate = spawn(path.join(__dirname, '..', 'node_modules', '.bin', 'babel-node'), generateArgs, { shell: true, stdio: 'inherit' })
    }

    generate.on('close', (code) => {
      console.log(clc.cyan('child process exited with code') + ' ' + code)
      process.exit(0)
    })
  }).on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe generate-posts --path /test --destination result --status publish')
    console.log()
  })

program
  .command('create [path]')
  .alias('c')
  .description('create new abe project')
  .action(function(dest, options){
    dest = (dest != null) ? dest : ''
    var dir = path.join(process.cwd(), dest)
    if(process.env.ROOT) {
      dir = path.join(process.env.ROOT, dest)
    }
    var create = new Create()
    if(typeof dir !== 'undefined' && dir !== null) {
      create.init(dir)
    }else {
      console.error('Error: no project path specified')
    }
  }).on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe create')
    console.log('    $ abe create [destination]')
    console.log()
  })

program
  .command('serve')
  .alias('s')
  .description('create http server for abe')
  .action(function(dest, options){
    var dir = process.cwd()
    if(process.env.ROOT) {
      dir = process.env.ROOT
    }
    var environment = process.env
    environment.ROOT = dir
    if (typeof port !== 'undefined' && port !== null) {
      environment.PORT = port
    }
    var command
    if (__dirname.indexOf('dist') > -1) {
      command = 'node --harmony ./dist/server/index.js'
    }else {
      command = path.join(__dirname, '..', 'node_modules', '.bin', 'babel-node') + ' --harmony ./src/server/index.js'
    }

    process.chdir(__dirname + '/../')
    console.log('website started : ' + dir)
    var cp = exec(command,{}, function (err, out, code) {
      if (err instanceof Error) throw err
      process.stderr.write(err)
      process.stdout.write(out)
      process.exit(code)
    })
    cp.stderr.pipe(process.stderr)
    cp.stdout.pipe(process.stdout)
  }).on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe serve')
    console.log()
  })

program
  .command('install [plugin]')
  .alias('i')
  .description('install abe plugin(s)')
  .action(function(plugin){
    var dir = process.cwd()
    if(process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }

    if(typeof plugin !== 'undefined' && plugin !== null) {
      plugins.instance.install(dir, plugin)
    } else {
      plugins.instance.install(dir)
    }
  }).on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe install')
    console.log('    $ abe install [plugin]')
    console.log()
  })

program
  .command('uninstall <plugin>')
  .alias('un')
  .description('uninstall abe plugin(s)')
  .action(function(plugin){
    var dir = process.env.ROOT.replace(/\/$/, '')
    if(process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }

    if(typeof plugin !== 'undefined' && plugin !== null) {
      plugins.instance.uninstall(dir, plugin)
    }
  }).on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe uninstall')
    console.log('    $ abe uninstall [plugin]')
    console.log()
  })

program.parse(process.argv)