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
  .option('-p, --port <port>', 'Port on which to listen to (defaults to 8000)', parseInt)
  .option('-i, --interactive', 'open in browser')
  .option('-N, --pname <pname>', 'pm2 server name')
  .option('-f, --folder <folder>', '--folder draft|sites')
  .option('-t, --type <type>', '--type draft|other')
  .option('-d, --destination <destination>', '--destination folder')
  .option('generate-posts, --path=<folder> --destination=<folder> --status=<status>', 'save only <status> posts into <destination> from <path> folder')
  .parse(process.argv)

var userArgs = process.argv.slice(2)
var create = new Create()
var port = program.port
var interactive = program.interactive

var vPos = process.argv.indexOf('-v')
if (vPos > -1) {
  process.argv[vPos] = '-V'
}

if(typeof userArgs[0] !== 'undefined' && userArgs[0] !== null){
  var dir
  var command
  var cp
  var plugin

  switch(userArgs[0]){
  case 'build':
    dir = process.cwd()
    process.chdir(__dirname + '/../')
    command = 'ROOT=' + dir +
				' FOLDER=' + (program.folder ? program.folder : 'draft') +
				' DEST=' + (program.destination ? program.destination : 'tmp') +
				' FLOW=' + (program.type ? program.type : 'draft') +
				' npm run build:folder'
    console.log('command : ' + command)
    execPromise.exec(command)
			.then(function (result) {
  var stdout = result.stdout
  var stderr = result.stderr
  if(stdout) {console.log('stdout: ', stdout)}
  if(stderr) {console.log('stderr: ', stderr)}
})
      .fail(function (err) {
        console.error('ERROR: ', err)
      })
      .progress(function () {
        
      })
    break
  case 'create':
    dir = userArgs[1]
    if(process.env.ROOT) {
      dir = process.env.ROOT + userArgs[1]
    }
    if(typeof dir !== 'undefined' && dir !== null) {
      create.init(dir)
    }else {
      console.error('Error: no project path specified')
    }
    break
  case 'serve':
    dir = process.cwd()
    if(process.env.ROOT) {
      dir = process.env.ROOT
    }
    var environment = process.env
    environment.ROOT = dir
    if (typeof port !== 'undefined' && port !== null) {
      environment.PORT = port
    }
    command = 'node --harmony ./dist/server/index.js'
			// if (interactive) command = 'OPENURL=1 ' + command
    process.chdir(__dirname + '/../')
    console.log('website started : ' + dir + (port ? ' on port :' + port : ''))
    cp = exec(command,
      {
        env: environment
      },
			function (err, out, code) {
  if (err instanceof Error) throw err
  process.stderr.write(err)
  process.stdout.write(out)
  process.exit(code)
})
    cp.stderr.pipe(process.stderr)
    cp.stdout.pipe(process.stdout)
    break
  case 'list':
    dir = process.cwd()
    dir = dir.replace(/\/$/, '')
    pm2.connect((err) => {
      if (err instanceof Error) throw err

      pm2.list(function(err, list) {
        if (err instanceof Error) throw err
        Array.prototype.forEach.call(list, (item) => {
          console.log('[ pm2 ]', '{', '"pid":', item.pid + ',', '"process":', '"' + item.name + '"', '}')
        })
        process.exit(0)
      })
    })
    break
  case 'servenodemon':
    dir = process.cwd()
    command = 'ROOT=' + dir + ' npm run startdev --node-args="--debug"'
    if (interactive) command = 'OPENURL=1 ' + command
    if(port) command = 'PORT=' + port + ' ' + command
    process.chdir(__dirname + '/../')
    console.log('website started : ' + dir + (port ? ' on port :' + port : ''))
    cp = exec(command, function (err, out, code) {
      if (err instanceof Error) {throw err}
      process.exit(code)
    })
    cp.stderr.pipe(process.stderr)
    cp.stdout.pipe(process.stdout)
    break
  case 'generate-posts':
    dir = process.cwd()
    if(process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }
    process.env.DEBUG = 'generate-posts:*'
    var generateArgs = ['--harmony', __dirname + '/cli/process/generate-posts.js', 'ABE_WEBSITE=' + dir]
    var isHelp = false
    Array.prototype.forEach.call(userArgs, (arg) => {
      if (arg.indexOf('--path=') > -1) {
        generateArgs.push('ABE_PATH=' + arg.split('=')[1])
      }else if (arg.indexOf('--destination=') > -1) {
        generateArgs.push('ABE_DESTINATION=' + arg.split('=')[1])
      }else if (arg.indexOf('--status=') > -1) {
        generateArgs.push('ABE_STATUS=' + arg.split('=')[1])
      }
    })

    const generate = spawn('node', generateArgs, { shell: true, stdio: 'inherit' })

    generate.on('close', (code) => {
      console.log(clc.cyan('child process exited with code') + ' ' + code)
      process.exit(0)
    })

    break
  case 'install':
    dir = process.cwd()
    plugin = userArgs[1]
    if(process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }

    if(typeof plugin !== 'undefined' && plugin !== null) {
      plugins.instance.install(dir, plugin)
    } else {
      plugins.instance.install(dir)
    }
    break
  case 'uninstall':
    dir = process.cwd()
    plugin = userArgs[1]
    if(process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }

    if(typeof plugin !== 'undefined' && plugin !== null) {
      plugins.instance.uninstall(dir, plugin)
    }
    break
  default:
    console.log('Help: use `create` or `serve` command')
    break
  }

}
else{
  console.log('Help: use `create` or `serve` command')
}