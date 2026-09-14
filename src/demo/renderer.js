import fse from 'fs-extra'
import path from 'path'

import {Page, config} from '../cli'

const pkg = require('../../package.json')

/**
 * Root of the fixed demo site bundled with the repository. It is resolved from
 * the module location so that it works identically from `src/demo` (dev/tests)
 * and from `dist/demo` (container), both of which sit two levels below the
 * repository root.
 */
export const DEMO_SITE_ROOT =
  process.env.ABE_DEMO_SITE_ROOT ||
  path.resolve(__dirname, '..', '..', 'demo', 'site')

export const DEMO_TEMPLATE_NAME = 'demo'

export const DEMO_TEMPLATE_PATH = path.join(
  DEMO_SITE_ROOT,
  'themes',
  'default',
  'templates',
  `${DEMO_TEMPLATE_NAME}.html`,
)

let template = null

/**
 * Load the fixed Abe template once and pin the ABECMS configuration to the
 * bundled demo site root. No user input ever reaches this function.
 */
export function initRenderer() {
  if (template !== null) return template

  config.set({root: DEMO_SITE_ROOT})
  template = fse.readFileSync(DEMO_TEMPLATE_PATH, 'utf8')

  return template
}

/**
 * Truthful description of the code path that produces the HTML.
 */
export const engine = Object.freeze({
  name: 'abecms',
  version: pkg.version,
  renderer: 'abecms.Page',
  module: path.relative(
    path.resolve(__dirname, '..', '..'),
    require.resolve('../cli/cms/Page'),
  ),
  template: `themes/default/templates/${DEMO_TEMPLATE_NAME}.html`,
  templateEngine: 'handlebars',
})

/**
 * Render an accepted demo document through the real ABECMS `Page` engine.
 *
 * `Page` performs the actual ABECMS work: Abe tag preparation (hidden tag
 * removal, slug stripping, each-block indexing, data source removal) followed by
 * Handlebars compilation with the ABECMS helper set and intl data.
 *
 * @param {Object} content already validated content document
 * @returns {String} HTML
 */
export function renderDemoPage(content) {
  const abeTemplate = initRenderer()

  const json = Object.assign({}, content, {
    abe_meta: {
      template: DEMO_TEMPLATE_NAME,
      link: `/${DEMO_TEMPLATE_NAME}.html`,
      status: content.status === 'published' ? 'publish' : 'draft',
    },
  })

  const page = new Page(abeTemplate, json, true)

  return page.html.trim()
}

export {Page}
