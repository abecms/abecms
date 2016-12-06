import chai from 'chai'
import path from 'path'
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'

import {
  cmsEditor,
  abeExtend,
  config
} from '../../../../src/cli'
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

import data from '../../../fixtures/editor/index'

var classAttr = 'form-control form-abe'

describe('printInput', function() {

  /**
   * cmsEditor.getLabel
   * 
   */
  it('cmsEditor.getLabel()', function() {
    var result = cmsEditor.getLabel(data.label)
    chai.expect(result).to.be.a('string')
    var label = /<label(\r|\t|\n|.)*?<\/label>/.test(result)
    chai.expect(label).to.be.true
  })

  /**
   * cmsEditor.getAttributes
   * 
   */
  it('cmsEditor.getAttributes()', function() {
    var result = cmsEditor.getAttributes(data.attributes)
    chai.expect(result).to.be.a('string')
    chai.expect(result).to.be.equal('id="key" data-id="key" value="value" maxlength="max-length" data-maxlength="max-length" reload="reload" tabIndex="order" data-required="required" data-display="display" data-visible="visible" data-autocomplete="autocomplete" placeholder="placeholder" data-size="thumbs" multiple disabled')
  })

  /**
   * cmsEditor.createInputSource
   * 
   */
  it('cmsEditor.createInputSource()', function() {
    var result0 = cmsEditor.createInputSource(data.source[0].attributes, classAttr, data.source[0].params)
    var select = /<select(\r|\t|\n|.)*?<\/select>/.test(result0)
    chai.expect(result0).to.be.a('string')
    chai.expect(select).to.be.true

    var result1 = cmsEditor.createInputSource(data.source[1].attributes, classAttr, data.source[1].params)
    var test1 = result1.indexOf('multiple')
    chai.expect(test1).to.be.above(-1)

    var result2 = cmsEditor.createInputSource(data.source[2].attributes, classAttr, data.source[2].params)
    var test2 = result2.indexOf('data-autocomplete')
    chai.expect(test2).to.be.above(-1)

    var result3 = cmsEditor.createInputSource(data.source[3].attributes, classAttr, data.source[3].params)
    var test3 = result3.indexOf('{"id":1,"name":"test 1","lang":"de"}')
    chai.expect(test3).to.be.above(-1)
  })

  /**
   * cmsEditor.createInputRich
   * 
   */
  it('cmsEditor.createInputRich()', function() {
    var result = cmsEditor.createInputRich(data.rich.attributes, classAttr, data.rich.params)
    chai.expect(result).to.be.a('string')
  })

  /**
   * cmsEditor.createInputFile
   * 
   */
  it('cmsEditor.createInputFile()', function() {
    var result = cmsEditor.createInputFile(data.file.attributes, classAttr, data.file.params)
    var input = /<input(\r|\t|\n|.)*?type=\"file\"(\r|\t|\n|.)*?>/.test(result)
    chai.expect(result).to.be.a('string')
    chai.expect(input).to.be.true
  })

  /**
   * cmsEditor.createInputTextarea
   * 
   */
  it('cmsEditor.createInputTextarea()', function() {
    var result = cmsEditor.createInputTextarea(data.textarea.attributes, classAttr, data.textarea.params)
    var textarea = /<textarea(\r|\t|\n|.)*?<\/textarea>/.test(result)
    chai.expect(result).to.be.a('string')
    chai.expect(textarea).to.be.true
  })

  /**
   * cmsEditor.createInputLink
   * 
   */
  it('cmsEditor.createInputLink()', function() {
    var result = cmsEditor.createInputLink(data.link.attributes, classAttr, data.link.params)
    var link = result.indexOf('glyphicon glyphicon-link')
    chai.expect(result).to.be.a('string')
    chai.expect(link).to.be.above(-1)
  })

  /**
   * cmsEditor.createInputImage
   * 
   */
  it('cmsEditor.createInputImage()', function() {
    var result = cmsEditor.createInputImage(data.image.attributes, classAttr, data.image.params)
    var image = result.indexOf('glyphicon glyphicon-picture')
    chai.expect(result).to.be.a('string')
    chai.expect(image).to.be.above(-1)
  })

  /**
   * cmsEditor.createInputText
   * 
   */
  it('cmsEditor.createInputText()', function() {
    var result = cmsEditor.createInputText(data.txt.attributes, classAttr, data.txt.params)
    var txt = result.indexOf('glyphicon glyphicon-font')
    chai.expect(result).to.be.a('string')
    chai.expect(txt).to.be.above(-1)
  })

  /**
   * cmsEditor.printInput
   * 
   */
  it('cmsEditor.printInput()', function() {
    var val = data.text;
    this.sinon = sinon.sandbox.create();
    this.sinon.stub(abeExtend.hooks.instance, 'trigger', function(param, html){
      return (param === 'beforeEditorInput') ? val : html;
    })
    var result = cmsEditor.printInput(val, {})
    chai.expect(result).to.be.a('string')
    var value = result.match(/value="[a-zA-Z0-9-]*"/ig)[0]
    chai.expect(value).to.equal('value="val2"')
    var reload = result.match(/reload="[a-zA-Z0-9-]*"/ig)[0]
    chai.expect(reload).to.equal('reload="val3"')
    var tabIndex = result.match(/tabIndex="[a-zA-Z0-9-]*"/ig)[0]
    chai.expect(tabIndex).to.equal('tabIndex="val4"')
    var dataRequired = result.match(/data-required="[a-zA-Z0-9-]*"/ig)[0]
    chai.expect(dataRequired).to.equal('data-required="val5"')
    var dataDisplay = result.match(/data-display="[a-zA-Z0-9-]*"/ig)[0]
    chai.expect(dataDisplay).to.equal('data-display="val6"')
    var dataVisible = result.match(/data-visible="[a-zA-Z0-9-]*"/ig)[0]
    chai.expect(dataVisible).to.equal('data-visible="val7"')
    var dataAutocomplete = result.match(/data-autocomplete="[a-zA-Z0-9-]*"/ig)[0]
    chai.expect(dataAutocomplete).to.equal('data-autocomplete="val8"')
    var placeholder = result.match(/placeholder="[a-zA-Z0-9-]*"/ig)[0]
    chai.expect(placeholder).to.equal('placeholder="val9"')

    this.sinon.restore()
  });
});
