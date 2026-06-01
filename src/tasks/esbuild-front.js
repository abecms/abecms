const esbuild = require('esbuild')
const path = require('path')

const shim = path.join(__dirname, 'esbuild-shim.js')

const bundles = [
  {
    in: 'src/server/public/abecms/scripts/admin.js',
    out: 'src/server/public/abecms/scripts/admin-compiled.js',
  },
  {
    in: 'src/server/public/abecms/scripts/user-login.js',
    out: 'src/server/public/abecms/scripts/user-login-compiled.js',
  },
  {
    in: 'src/server/public/abecms/scripts/template-engine.js',
    out: 'src/server/public/abecms/scripts/template-engine-compiled.js',
  },
]

const shared = {
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome90', 'firefox88', 'safari14'],
  logLevel: 'info',
  inject: [shim],
  banner: {js: 'var global=globalThis;'},
  define: {
    global: 'globalThis',
  },
}

async function main() {
  const watch = process.argv.includes('--watch')
  const contexts = await Promise.all(
    bundles.map(({in: entry, out}) =>
      esbuild.context({...shared, entryPoints: [entry], outfile: out}),
    ),
  )

  await Promise.all(contexts.map(context => context.rebuild()))

  if (watch) {
    await Promise.all(contexts.map(context => context.watch()))
    console.log('esbuild watching admin front bundles')
    return
  }

  await Promise.all(contexts.map(context => context.dispose()))
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
