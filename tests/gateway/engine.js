/**
 * Evidence that the demo gateway renders through the real ABECMS product code
 * and not a lookalike reimplementation.
 */
const chai = require('chai')
const fs = require('fs')

const abe = require('../../src/cli')
const renderer = require('../../src/demo/renderer')
const pkg = require('../../package.json')

describe('Demo gateway / ABECMS engine binding', function () {
  before(function () {
    renderer.initRenderer()
  })

  it('uses the Page class exported by the ABECMS product entrypoint', function () {
    chai.expect(renderer.Page).to.equal(abe.Page)
    chai
      .expect(renderer.Page)
      .to.equal(require('../../src/cli/cms/Page').default)
  })

  it('reports the real product name, version and renderer', function () {
    chai.expect(renderer.engine.name).to.equal('abecms')
    chai.expect(renderer.engine.version).to.equal(pkg.version)
    chai.expect(renderer.engine.renderer).to.equal('abecms.Page')
    chai.expect(renderer.engine.module).to.match(/cli[/\\]cms[/\\]Page\.js$/)
  })

  it('pins the ABECMS config root to the bundled demo site', function () {
    chai.expect(abe.config.get('root')).to.equal(renderer.DEMO_SITE_ROOT)
  })

  it('renders from a fixed Abe template made of Abe tags', function () {
    const template = fs.readFileSync(renderer.DEMO_TEMPLATE_PATH, 'utf8')
    chai.expect(template).to.match(/\{\{abe type='text' key='title'/)
    chai.expect(template).to.match(/\{\{abe type='textarea' key='introduction'/)
  })

  it('applies ABECMS-specific Abe tag preparation (hidden tags are removed)', function () {
    const template = fs.readFileSync(renderer.DEMO_TEMPLATE_PATH, 'utf8')
    // The template carries an Abe tag flagged visible='false'. Only ABECMS'
    // cmsTemplates.prepare.removeHiddenAbeTag strips it; plain Handlebars would
    // leave the tag (or fail) in place.
    chai.expect(template).to.contain("key='internalNote'")

    const html = renderer.renderDemoPage({
      title: 'Engine proof',
      introduction: '',
      ctaLabel: '',
      status: 'draft',
    })

    chai.expect(html).to.not.contain('internalNote')
    chai.expect(html).to.not.contain('{{abe')
    chai.expect(html).to.contain('Engine proof')
  })

  it('produces the exact same HTML as a direct abecms.Page invocation', function () {
    const content = {
      title: 'Parity',
      introduction: 'Intro',
      ctaLabel: 'Go',
      status: 'published',
    }
    const template = fs.readFileSync(renderer.DEMO_TEMPLATE_PATH, 'utf8')
    const direct = new abe.Page(
      template,
      Object.assign({}, content, {
        abe_meta: {template: 'demo', link: '/demo.html', status: 'publish'},
      }),
      true,
    )

    chai.expect(renderer.renderDemoPage(content)).to.equal(direct.html.trim())
  })
})
