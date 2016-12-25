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
          attributeConcat: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-attribute-concat.html'), 'utf-8'),
          attributeMultiple: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-attribute-multiple.html'), 'utf-8'),
          source: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-source.html'), 'utf-8'),
          each: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-each.html'), 'utf-8'),
          eachMultiple: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-abe-each-multiple.html'), 'utf-8'),
          rawHandlebar: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-raw-handlebars.html'), 'utf-8'),
          noHtml: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'prepare-tag-nohtml.html'), 'utf-8')
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
    chai.expect(template.indexOf('<span data-abe-text_visible="text_visible" >')).to.be.above(-1);

    template = cmsTemplates.prepare.addAbeDataAttrForHtmlTag(this.fixture.each)
    chai.expect(template.indexOf('data-abe-test[index].title="test[index].title"')).to.be.above(-1)

    //
    try{
      template = cmsTemplates.prepare.addAbeHtmlTagBetweenAbeTags(this.fixture.noHtml)
      template = cmsTemplates.prepare.addAbeDataAttrForHtmlTag(template)
    } catch (e) {
      console.log(e.stack)
    }
    chai.expect(template.indexOf('"<abe data-abe-stores[index].lat="stores[index].lat"')).to.be.above(-1)
    chai.expect(template.indexOf('<abe data-abe-stores2[index].lat="stores2[index].lat" >')).to.be.above(-1)
    chai.expect(template.indexOf('<abe data-abe-text2="text2" >{{abe type="text" key="text2" desc="name"}}</abe>')).to.be.above(-1)
    chai.expect(template.indexOf('"<abe data-abe-text3="text3" >{{abe type="text" key="text3" desc="name"}}</abe>"')).to.be.above(-1)
  });

  /**
   * cmsTemplates.template.getAbeAttributeData
   * 
   */
  it('cmsTemplates.prepare.getAbeAttributeData()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.getAbeAttributeData(
      this.fixture.attribute,
      "src=\"{{abe type='image' key='image_key' tab='default'}}\"",
      "src",
      "{{abe type='image' key='image_key' tab='default'}}"
    )
    chai.expect(template.indexOf('data-abe-attr-image_key="src" data-abe-image_key="image_key"')).to.be.above(-1);
  });

  /**
   * cmsTemplates.template.addHasAbeAttr
   * 
   */
  it('cmsTemplates.prepare.addHasAbeAttr()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.addHasAbeAttr("}}")
    chai.expect(template.indexOf('has-abe=1}}')).to.be.above(-1);
  });

  /**
   * cmsTemplates.template.addAbeDataAttrForHtmlAttributes
   * 
   */
  it('cmsTemplates.prepare.addAbeDataAttrForHtmlAttributes()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.addAbeDataAttrForHtmlAttributes(this.fixture.attribute)
    chai.expect(template.indexOf('data-abe-attr-image_key="src" data-abe-image_key="image_key"')).to.be.above(-1);

    template = cmsTemplates.prepare.addAbeDataAttrForHtmlAttributes(this.fixture.attributeConcat)
    chai.expect(template.indexOf('data-abe-attr-image_key="src" data-abe-image_key="image_key"')).to.be.above(-1);

    template = cmsTemplates.prepare.addAbeDataAttrForHtmlAttributes(this.fixture.attributeMultiple)
    chai.expect(template.indexOf('data-abe-attr-image_key="src" data-abe-image_key="image_key"')).to.be.above(-1);
    chai.expect(template.indexOf('data-abe-attr-alternate="alt" data-abe-alternate="alternate" alt="mon alt')).to.be.above(-1);

    template = cmsTemplates.prepare.addAbeDataAttrForHtmlAttributes(this.fixture.each)
    chai.expect(template.indexOf('data-abe-attr-test[index].img="src"  data-abe-test[index].img="test[index].img" data-abe-attr-test{{@index}}.img="src" data-abe-test{{@index}}.img="test[index].img" src="')).to.be.above(-1);

    template = cmsTemplates.prepare.addAbeDataAttrForHtmlAttributes(this.fixture.eachMultiple)
    chai.expect(template.indexOf('data-abe-attr-test[index].img="src"  data-abe-test[index].img="test[index].img" data-abe-attr-test{{@index}}.img="src" data-abe-test{{@index}}.img="test[index].img" src="')).to.be.above(-1);
    chai.expect(template.indexOf('data-abe-attr-test[index].alternate="alt"  data-abe-test[index].alternate="test[index].alternate" data-abe-attr-test{{@index}}.alternate="alt" data-abe-test{{@index}}.alternate="test[index].alternate" alt="')).to.be.above(-1);
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

    template = cmsTemplates.prepare.addAbeHtmlTagBetweenAbeTags(this.fixture.noHtml)
    chai.expect(template.indexOf('"lat": "<abe>{{abe type="text" key="stores.lat" desc="lat"}}</abe>"')).to.be.above(-1)
    chai.expect(template.indexOf('<abe>{{abe type="text" key="stores2.lat" desc="lat"}}</abe>')).to.be.above(-1)
    chai.expect(template.indexOf('<abe>{{abe type="text" key="text2" desc="name"}}</abe>')).to.be.above(-1)
    chai.expect(template.indexOf('"<abe>{{abe type="text" key="text3" desc="name"}}</abe>"')).to.be.above(-1)

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
    chai.expect(template.indexOf('data-abe-block="test{{@index}}"')).to.be.above(-1);
    chai.expect(template.indexOf('<!-- [[test]]')).to.be.above(-1);

    var template = cmsTemplates.prepare.indexEachBlocks(this.fixture.eachMultiple, false)
    chai.expect(template.indexOf('data-abe-block')).to.be.above(-1);
    chai.expect(template.indexOf('abe dictionnary=')).to.be.above(-1);
  });

  /**
   * cmsTemplates.template.addAbeDictionnary
   * 
   */
  it('cmsTemplates.prepare.addAbeDictionnary()', function() {
    // stub

    // test
    var template = cmsTemplates.prepare.addAbeDictionnary(this.fixture.each, "{{abe type='text' key='test.title' desc='test title' tab='default'}}", 'test')
    chai.expect(template.indexOf("abe dictionnary='test'")).to.be.above(-1);
  });
});
