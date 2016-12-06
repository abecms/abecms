var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var abeExtend = require('../../../src/cli').abeExtend;
var cmsData = require('../../../src/cli').cmsData;
var cmsTemplates = require('../../../src/cli').cmsTemplates;
var coreUtils = require('../../../src/cli').coreUtils;
var Manager = require('../../../src/cli').Manager;

describe('cmsTemplates.prepare', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          visibleTrue: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-visible-true.html'), 'utf-8'),
          visibleFalse: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-visible-false.html'), 'utf-8'),
          text: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-text.html'), 'utf-8'),
          attribute: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-attribute.html'), 'utf-8'),
          source: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-source.html'), 'utf-8'),
          each: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-each.html'), 'utf-8'),
          rawHandlebar: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-raw-handlebars.html'), 'utf-8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsTemplates.template.addAbeDataAttrForHtmlTag
   * 
   */
  it('cmsTemplates.prepare.addAbeDataAttrForHtmlTag()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.addAbeDataAttrForHtmlTag(this.fixture.text)
    chai.expect(template.indexOf('data-abe-')).to.be.above(-1);
  });

  /**
   * cmsTemplates.template.addAbeDataAttrForHtmlAttributes
   * 
   */
  it('cmsTemplates.prepare.addAbeDataAttrForHtmlAttributes()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.addAbeDataAttrForHtmlAttributes(this.fixture.attribute)
    chai.expect(template.indexOf('data-abe-attr-')).to.be.above(-1);
  });

  /**
   * cmsTemplates.template.addAbeSourceComment
   * 
   */
  it('cmsTemplates.prepare.addAbeSourceComment()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.addAbeSourceComment(this.fixture.source,
      {
        abe_source: {
          data_key: [{title: "test"}]
        }
      }
    )
    
    chai.expect(template.indexOf('<!-- [[')).to.be.above(-1);
    chai.expect(template.indexOf('-->')).to.be.above(-1);
  });

  /**
   * cmsTemplates.template.addAbeHtmlTagBetweenAbeTags
   * 
   */
  it('cmsTemplates.prepare.addAbeHtmlTagBetweenAbeTags()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.addAbeHtmlTagBetweenAbeTags(this.fixture.text)
    chai.expect(template.indexOf('<abe>{{')).to.be.above(-1);
    chai.expect(template.indexOf('}}</abe>')).to.be.above(-1);
  });

  /**
   * cmsTemplates.template.replaceAbeEachIndex
   * 
   */
  it('cmsTemplates.prepare.replaceAbeEachIndex()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.replaceAbeEachIndex('[index].')
    chai.expect(template).to.be.equal('{{@index}}-');
  });

  /**
   * cmsTemplates.template.removeHiddenAbeTag
   * 
   */
  it('cmsTemplates.prepare.removeHiddenAbeTag()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.removeHiddenAbeTag(this.fixture.visibleFalse)
    chai.expect(template).to.be.equal("");

    // test
    var template2 = cmsTemplates.prepare.removeHiddenAbeTag(this.fixture.visibleTrue)
    chai.expect(template2.indexOf('{{abe')).to.be.above(-1);
  });

  /**
   * cmsTemplates.template.removeHandlebarsRawFromHtml
   * 
   */
  it('cmsTemplates.prepare.removeHandlebarsRawFromHtml()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.removeHandlebarsRawFromHtml(this.fixture.rawHandlebar)
    chai.expect(template).to.be.equal("test");
  });

  /**
   * cmsTemplates.template.splitEachBlocks
   * 
   */
  it('cmsTemplates.prepare.splitEachBlocks()', function() {
    // stub

    // test
    var blocks = cmsTemplates.prepare.splitEachBlocks(this.fixture.each)
    chai.expect(blocks.length).to.be.above(0);
  });

  /**
   * cmsTemplates.template.indexEachBlocks
   * 
   */
  it('cmsTemplates.prepare.indexEachBlocks()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.indexEachBlocks(this.fixture.each, false)
    chai.expect(template.indexOf('data-abe-block')).to.be.above(-1);
    chai.expect(template.indexOf('<!-- [[test]]')).to.be.above(-1);
  });
});
