var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
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
  let fixture
  before(async () => {
    await Manager.instance.init()
    Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
    await Manager.instance.updateList()

    fixture = {
      htmlArticle: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article.html'), 'utf8'),
      jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'files', 'article-2.json')),
      jsonHomepage: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'homepage-1.json'))
    }
  })

  it('cmsOperations.remove.removeRevision()', async () => {
    sinon.stub(fse, 'remove').callsFake( () => { return null; });
    sinon.stub(coreUtils.file, 'exist').callsFake( () => { return null; });

    var res = await cmsOperations.remove.removeRevision('test.html')
    chai.expect(res).to.be.equal(undefined);

    sinon.restore()
  });

  it('cmsOperations.remove.remove()', async () => {
    sinon.stub(abeExtend.hooks.instance, 'trigger').callsFake( (str, obj) => { return str, obj; });
    sinon.stub(cmsOperations.remove, 'removeRevision').callsFake( () => { return null; });
    sinon.stub(cmsOperations.remove, 'removePost').callsFake( () => { return null; });
    sinon.stub(cmsData.revision, 'getVersions').callsFake( () => { return []; });
    sinon.stub(Manager.instance, 'removePostFromList').callsFake( () => { return null; });

    var res = await cmsOperations.remove.remove('test.html')
    chai.expect(res).to.be.equal(undefined);

    sinon.restore()
  });
});
