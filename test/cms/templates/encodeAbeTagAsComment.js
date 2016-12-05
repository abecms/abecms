var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var cmsTemplates = require('../../../src/cli').cmsTemplates;
var cmsData = require('../../../src/cli').cmsData;
var Manager = require('../../../src/cli').Manager;

describe('cmsTemplates', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          articleEach: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article-each-abe.html'), 'utf-8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsTemplates.encodeAbeTagAsComment
   * 
   */
  it('cmsTemplates.encodeAbeTagAsComment()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var validDataAbe = sinonInstance.stub(cmsData.regex, 'validDataAbe');
    validDataAbe.returns('')

    // test
    var txt = cmsTemplates.encodeAbeTagAsComment(this.fixture.articleEach);
    chai.expect(txt.indexOf('{')).to.equal(-1);

    // unstub
    sinon.assert.calledOnce(cmsData.regex.validDataAbe)
    cmsData.regex.validDataAbe.restore()
  });
});
