var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

import data from '../../../fixtures/editor/compileAbeData.json'
import compileAbe from '../../../../../src/cli/cms/editor/handlebars/compileAbe'
import Handlebars from 'handlebars'
import abeEngine from '../../../../../src/cli/cms/editor/handlebars/abeEngine'
import xss from 'xss'

describe('compileAbe', function() {
  before( function(done) {
    done()  
  });

  /**
   * compileAbe.group
   * 
   */
  it('compileAbe.text', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(abeEngine, 'instance', { get: function () { return {content: data.compileSimpleText.content} } })
    var result = compileAbe(data.compileSimpleText.argumentSimpleText)
    stub.restore()
    chai.expect(result).to.be.a('string');
    chai.expect(result).to.be.equal('test value');
  });

  /**
   * compileAbe.group
   * 
   */
  it('compileAbe.rte', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(abeEngine, 'instance', { get: function () { return {content: data.compileRTE.content} } })
    var result = compileAbe(data.compileRTE.argumentRTE)
    stub.restore()
    chai.expect(result).to.be.a('object');
    chai.expect(result.string).to.be.equal('alert(1);<div>value</div>');
  });

});
