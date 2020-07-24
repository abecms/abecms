var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var cmsTemplates = require('../../../../src/cli').cmsTemplates;
var cmsData = require('../../../../src/cli').cmsData;
var Manager = require('../../../../src/cli').Manager;

describe('cmsTemplates', function() {
  let fixture
  before(async () => {
    await Manager.instance.init()
    fixture = {
      articleEach: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-each-abe.html'), 'utf-8')
    }
  })

  /**
   * cmsTemplates.encodeAbeTagAsComment
   * 
   */
  it('cmsTemplates.encodeAbeTagAsComment()', function() {
    var validDataAbe = sinon.stub(cmsData.regex, 'validDataAbe');
    validDataAbe.returns('')

    // test
    var txt = cmsTemplates.encodeAbeTagAsComment(fixture.articleEach);
    chai.expect(txt.indexOf('{')).to.equal(-1);

    sinon.assert.calledOnce(cmsData.regex.validDataAbe)
    sinon.restore()
  });
});
