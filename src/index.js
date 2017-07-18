#!/usr/bin/env node
import {initSite} from './cli/cms/operations'
import plugins from './cli/extend/plugins'
import config from './cli/core/config/config'
import {exec} from 'child_process'
import {spawn} from 'child_process'
import path from 'path'
import program from 'commander'
import pkg from '../package'
import inquirer from 'inquirer'
import clc from 'cli-color'

program.version(pkg.version).option('-v, --version', 'version')

// Dev: ./node_modules/.bin/babel-node --presets es2015 src/index.js init
program
  .command('init')
  .alias('i')
  .description('init a new abe website')
  .action(function(options) {
    const create = new initSite()
    create.askQuestions().then(function(answers) {
      let dir = path.join(process.cwd(), answers.name)
      if (process.env.ROOT) {
        dir = path.join(process.env.ROOT, answers.name)
      }
      config.root = dir
      process.env['HOME'] = dir

      if (typeof dir !== 'undefined' && dir !== null && answers.name !== '') {
        create.init(dir).then(function() {
          create.updateSecurity(answers).then(function() {
            create.updateTheme(answers).then(function() {
              if (answers.plugins && answers.plugins.length > 0) {
                Array.prototype.forEach.call(answers.plugins, plugin => {
                  console.log('installing the plugin: ' + plugin)

                  if (typeof plugin !== 'undefined' && plugin !== null) {
                    plugins.instance.install(dir, plugin)
                  } else {
                    plugins.instance.install(dir)
                  }
                })
              }
              console.log(
                clc.green(
                  'Yeahhh! Your Abe site ' +
                    answers.name +
                    ' is ready to launch!  🚀  '
                ),
                clc.cyan('\ncd ' + answers.name + '\nabe serve -i')
              )
            })
          })
        })
      }
    })
  })
  .on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe init')
    console.log()
  })

program
  .command('create [path]')
  .alias('c')
  .description('create new abe project')
  .action(function(dest) {
    dest = dest != null ? dest : ''
    var dir = path.join(process.cwd(), dest)
    if (process.env.ROOT) {
      dir = path.join(process.env.ROOT, dest)
    }
    var create = new initSite()
    if (typeof dir !== 'undefined' && dir !== null && dest !== '') {
      create.init(dir)
    } else {
      console.log('error creating the project')
    }
  })
  .on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe create')
    console.log('    $ abe create [destination]')
    console.log()
  })

program
  .command('generate-posts')
  .alias('gp')
  .description('save post to file with type from folder')
  .option('-t, --type [type]', 'posts status draft|other')
  .option('-p, --path [path]', 'path /relative/path')
  .option('-d, --destination [destination]', 'folder to save result')
  .action(function(options) {
    var dir = process.cwd()
    if (process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }
    process.env.DEBUG = 'generate-posts:*'
    var generateArgs = [
      '--harmony',
      __dirname + '/cli/process/generate-posts.js',
      'ABE_WEBSITE=' + dir
    ]
    if (options.destination != null) {
      generateArgs.push('ABE_DESTINATION=' + options.destination)
    }
    if (options.path != null) {
      generateArgs.push('ABE_PATH=' + options.path)
    }
    if (options.type != null) {
      generateArgs.push('ABE_STATUS=' + options.type)
    }

    var generate
    if (__dirname.indexOf('dist') > -1) {
      generate = spawn('node', generateArgs, {shell: true, stdio: 'inherit'})
    } else {
      generate = spawn(
        path.join(__dirname, '..', 'node_modules', '.bin', 'babel-node'),
        generateArgs,
        {shell: true, stdio: 'inherit'}
      )
    }

    generate.on('close', code => {
      console.log('child process exited with code ' + code)
      process.exit(0)
    })
  })
  .on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log(
      '    $ abe generate-posts --path /test --destination result --status publish'
    )
    console.log()
  })

program
  .command('serve')
  .alias('s')
  .description(
    'create a http server for abe in development mode (debugger + livereload). If you want to deactivate development mode, use -e option'
  )
  .option('-p, --port [number]', 'change port of the web server')
  .option('-i, --interactive', 'open browser on web server startup')
  .option(
    '-e, --env [development|production|...]',
    'Abe is launched in development mode by default. Use another value to deactivate development mode. You may also use a global env variable NODE_ENV.'
  )
  .action(function(options) {
    var environment = process.env
    var dir = process.cwd()
    var command

    if (environment.ROOT) {
      dir = environment.ROOT
    }
    environment.ROOT = dir

    if (typeof environment.NODE_ENV == 'undefined') {
      if (
        options.env != null &&
        options.env !== 'development' &&
        options.env !== 'dev'
      ) {
        environment.NODE_ENV = options.env
      } else {
        environment.NODE_ENV = 'development'
      }
    }

    if (options.port != null) {
      environment.PORT = options.port
    }

    if (__dirname.indexOf('dist') > -1) {
      command = 'node --harmony ./dist/server/index.js'
    } else {
      command =
        path.join(__dirname, '..', 'node_modules', '.bin', 'babel-node') +
        ' --harmony ./src/server/index.js'
    }

    if (options.interactive != null) {
      command = 'OPENURL=1 ' + command
    }

    process.chdir(__dirname + '/../')

    console.log('website started : ' + dir)

    var cp = exec(command, {env: environment, maxBuffer: 1024 * 500}, function(
      err,
      out,
      code
    ) {
      try {
        if (err instanceof Error) throw err
        process.stderr.write(err)
        process.stdout.write(out)
      } catch (e) {}
      process.exit(code)
    })
    cp.stderr.pipe(process.stderr)
    cp.stdout.pipe(process.stdout)
  })
  .on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe serve')
    console.log()
  })

program
  .command('install [plugin]')
  .description('install abe plugin(s)')
  .action(function(plugin) {
    var dir = process.cwd()
    if (process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }

    if (typeof plugin !== 'undefined' && plugin !== null) {
      plugins.instance.install(dir, plugin)
    } else {
      plugins.instance.install(dir)
    }
  })
  .on('--help', function() {
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
  .action(function(plugin) {
    var dir = process.env.ROOT.replace(/\/$/, '')
    if (process.env.ROOT) {
      dir = process.env.ROOT.replace(/\/$/, '')
    }

    if (typeof plugin !== 'undefined' && plugin !== null) {
      plugins.instance.uninstall(dir, plugin)
    }
  })
  .on('--help', function() {
    console.log('  Examples:')
    console.log()
    console.log('    $ abe uninstall')
    console.log('    $ abe uninstall [plugin]')
    console.log()
  })

program.parse(process.argv)
