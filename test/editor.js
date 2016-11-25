import chai from 'chai'
import path from 'path'
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'
import {config} from '../src/cli'
config.set({root: path.join(__dirname,'fixtures')})

import {
  cmsEditor,
  abeExtend
} from '../src/cli'

import data from './fixtures/editor/index'

describe('Editor', function() {
  
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

  /**
   * cmsEditor.folders
   * 
   */
  it('cmsEditor.folders()', function() {
    var result = cmsEditor.folders([{path: ''}], 1, null, {'level-1': 'my wording'})
    var wordingExist = result.indexOf('my wording')
    chai.expect(result).to.be.a('string')
    chai.expect(wordingExist).to.equal(110)
  });

});
