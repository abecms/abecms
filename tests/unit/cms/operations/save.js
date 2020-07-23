var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var mkdirp = require('mkdirp');
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var abeExtend = require('../../../../src/cli').abeExtend
var cmsData = require('../../../../src/cli').cmsData
var Manager = require('../../../../src/cli').Manager
var coreUtils = require('../../../../src/cli').coreUtils
var cmsOperations = require('../../../../src/cli').cmsOperations
var cmsTemplates = require('../../../../src/cli').cmsTemplates
var Manager = require('../../../../src/cli').Manager;
var Page = require('../../../../src/cli').Page;

describe('cmsOperations', function() {
  before(async () => {
    await Manager.instance.init()
    Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
    await Manager.instance.updateList()
  })

  /**
   * cmsOperations.save.saveJson
   * 
   */
  it('cmsOperations.save.saveJson()', async () => {
    sinon.stub(fse, 'writeJsonSync').callsFake( () => { return null; });
    // sinon.stub(xss, 'exist').callsFake( () => { return null; });

    var res = await cmsOperations.save.saveJson('test.json', {})
    chai.expect(res).to.be.equal(true);

    sinon.restore()
  });

  /**
   * cmsOperations.save.saveHtml
   * 
   */
  it('cmsOperations.save.saveHtml()', async () => {
    sinon.stub(fse, 'writeFile').callsFake( () => { return null; });
    sinon.stub(mkdirp, 'sync').callsFake( () => { return null; });

    var res = await cmsOperations.save.saveHtml('test.json', {})
    chai.expect(res).to.be.equal(true);

    sinon.restore()
  });
});
