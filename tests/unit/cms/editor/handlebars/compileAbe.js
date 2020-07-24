var chai = require('chai');
var sinonChai = require('sinon-chai')
chai.use(sinonChai)
var path = require('path');


var config = require('../../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

import data from '../../../fixtures/editor/compileAbeData.json'
import compileAbe from '../../../../../src/cli/cms/editor/handlebars/compileAbe'
import abeEngine from '../../../../../src/cli/cms/editor/handlebars/abeEngine'

describe('compileAbe', function() {
  before( function(done) {
    abeEngine.instance.content = data.compileSimpleText.content
    done()  
  });

  /**
   * compileAbe.group
   * 
   */
  it('compileAbe.text', function() {
    abeEngine.instance.content = data.compileSimpleText.content
    var result = compileAbe(data.compileSimpleText.argumentSimpleText)

    chai.expect(result).to.be.a('string');
    chai.expect(result).to.be.equal('test value');
  });

  /**
   * compileAbe.group
   * 
   */
  it('compileAbe.rte', function() {
    abeEngine.instance.content = data.compileRTE.content
    var result = compileAbe(data.compileRTE.argumentRTE)

    chai.expect(result).to.be.a('object');
    chai.expect(result.string).to.be.equal('alert(1);<div>value</div>');
  });

});
