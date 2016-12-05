var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var cmsTemplates = require('../../../src/cli').cmsTemplates;

describe('cmsTemplates', function() {
  /**
   * cmsTemplates.insertDebugtoolUtilities
   * 
   */
  it('cmsTemplates.insertDebugtoolUtilities()', function() {
    var txt = cmsTemplates.insertDebugtoolUtilities('</body>', false);
    chai.expect(txt.length).to.above(10);
  });
});
