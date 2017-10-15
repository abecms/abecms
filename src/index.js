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
import Surge from 'surge'

const surge = new Surge()
const hooks = {}
let deployPlugins = []
let websiteName = null
let dir = null

const deployWebsite = function() {
  const create = new initSite()
  create.askDeploymentQuestions().then(function(answers) {
    if (answers.deploy) {
      let json = null
      if (answers.which === "on surge (it's free !)") {
        deployPlugins.push('abecms/abe-deployer-surge')
        json = {
          deployers: {
            surge: {
              active: true,
              domain: answers.domain
            }
          }
        }
        config.save(json)
        surge.login({
          postAuth: installPlugins
        })([])
      } else if (answers.which === 'a github repository') {
        deployPlugins.push('abecms/abe-deployer-git')
        json = {
          deployers: {
            git: {
              active: true,
              repository: answers.repository,
              branch: answers.branch,
              username: answers.username,
              email: answers.email
            }
          }
        }
        config.save(json)
        installPlugins()
      } else if (answers.which === 'a S3 bucket') {
        deployPlugins.push('abecms/abe-deployer-s3')
        json = {
          deployers: {
            s3: {
              active: true,
              region: answers.region,
              accessKeyId: answers.accessKeyId,
              secretAccessKey: answers.secretAccessKey,
              bucket: answers.bucket,
              prefix: answers.prefix
            }
          }
        }
        config.save(json)
        installPlugins()
      } else if (answers.which === 'via (S)FTP') {
        deployPlugins.push('abecms/abe-deployer-sftp')
        json = {
          deployers: {
            sftp: {
              active: true,
              host: answers.host,
              username: answers.username,
              remoteDir: answers.remoteDir,
              protocol: answers.protocol
            }
          }
        }
        if (answers.requiresType === 'It requires a password') {
          json.deployers.sftp.requiresPassword = true
          json.deployers.sftp.requireSSHKey = false
          json.deployers.sftp.password = answers.password
        } else {
          json.deployers.sftp.requiresPassword = false
          json.deployers.sftp.requireSSHKey = true
          json.deployers.sftp.sshKeyPath = answers.sshKeyPath
        }
        config.save(json)
        installPlugins()
      }
    } else {
      installPlugins()
    }
  })
}

const installWebsite = function() {
  const create = new initSite()
  create.askQuestions().then( answers => {
    dir = path.join(process.cwd(), answers.name)
    websiteName = answers.name
    if (process.env.ROOT) {
      dir = path.join(process.env.ROOT, answers.name)
    }
    config.root = dir
    process.env['HOME'] = dir

    create
      .init(dir)
      .then(() => create.updateSecurity(answers))
      .then(() => create.updateTheme(answers))
      .then(() => deployWebsite())
  })
}

const installPlugins = function() {
  const create = new initSite()
  create.askPluginsQuestions().then(function(answers) {
    if (answers.plugins && answers.plugins.length > 0) {
      answers.plugins.forEach(plugin => {
        console.log('installing the plugin: ' + plugin)

        if (typeof plugin !== 'undefined' && plugin !== null) {
          plugins.instance.install(dir, plugin)
        } else {
          plugins.instance.install(dir)
        }
      })
    }
    if (deployPlugins && deployPlugins.length > 0) {
      deployPlugins.forEach(plugin => {
        console.log(`installing the plugin: ${plugin}`)

        if (typeof plugin !== 'undefined' && plugin !== null) {
          plugins.instance.install(dir, plugin)
        }
      })
    }
    console.log(
      clc.green(
        `Yeahhh! Your Abe site ${websiteName} is ready to launch!  🚀  \n`
      ),
      clc.cyan(`cd ${websiteName}\n`),
      clc.cyan(`abe serve -i`)
    )
  })
}

program.version(pkg.version).option('-v, --version', 'version')

// Dev: ./node_modules/.bin/babel-node --presets es2015 src/index.js init
program
  .command('init')
  .alias('i')
  .description('init a new abe website')
  .action(function(options) {
    installWebsite()
  })
  .on('--help', function() {
    console.log(
      '  Examples:\n',
      '\n',
      '   $ abe init\n',
      ''
    )
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
    console.log(
      '  Examples:\n',
      '\n',
      '    $ abe create\n',
      '    $ abe create [destination]\n',
      ''
    )
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
    console.log(
      '  Examples:\n',
      '\n',
      '    $ abe generate-posts --path /test --destination result --status publish\n',
      ''
    )
  })

program
  .command('serve')
  .alias('s')
  .description(
    'create a http server for abe in development mode (debugger + livereload). If you want to deactivate development mode, use -e option'
  )
  .option('-p, --port [number]', 'change port of the web server')
  .option('-i, --interactive', 'open browser on web server startup')
  .option('-t, --templates [path]', 'give an absolute or relative path to your templates')
  .option('-a, --assets [path]', 'give an absolute or relative path to your assets')
  .option('-d, --destination [path]', 'give an absolute or relative path to your destination directory')
  .option('-j, --json [path]', 'give an absolute or relative path to your data directory')  
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

    if (typeof options.port != 'undefined') {
      environment.PORT = options.port
    }

    if (typeof options.templates != 'undefined') {
      environment.ABE_TEMPLATES_PATH = options.templates
    }

    if (typeof options.assets != 'undefined') {
      environment.ABE_ASSETS_PATH = options.assets
    }

    if (typeof options.destination != 'undefined') {
      environment.ABE_DESTINATION_PATH = options.destination
    }

    if (typeof options.json != 'undefined') {
      environment.ABE_JSON_PATH = options.json
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
    console.log(
      '  Examples:\n',
      '\n',
      '    $ abe serve\n',
      ''
    )
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
    console.log(
      '  Examples:\n',
      '\n',
      '    $ abe install\n',
      '    $ abe install [plugin]',
      ''
    )
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
    console.log([
      '  Examples:',
      '',
      '    $ abe uninstall',
      '    $ abe uninstall [plugin]',
      ''
    ])
  })

// Surge
program
  .command('login')
  .action(surge.login(hooks))
  .description('Login on Surge to publish projects to the web.')

hooks.preAuth = function(req, next) {
  console.log('')
  if (req.authed) {
    console.log(`       Hello ${req.creds.email} !`)
  } else {
    console.log('       Welcome!')
  }
  console.log('')

  next()
}

program.parse(process.argv)
