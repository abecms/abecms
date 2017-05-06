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
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          htmlArticle: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article.html'), 'utf8'),
          jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'files', 'article-2.json')),
          jsonHomepage: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'homepage-1.json'))
        }
        done()
        
      }.bind(this))
  });

  it('cmsOperations.duplicate()', function(done) {
    // stub
    var s = sinon.sandbox.create();
    s.stub(abeExtend.hooks.instance, 'trigger', function (str, obj) { return str, obj; }.bind(this));
    s.stub(Manager.instance, 'getList', function (str, obj) { return [this.fixture.jsonArticle]; }.bind(this));
    s.stub(coreUtils.slug, 'clean', function (p) { return p; }.bind(this));
    s.stub(coreUtils.array, 'filter', function () { return [this.fixture.jsonArticle]; }.bind(this));
    s.stub(cmsData.file, 'get', function () { return this.fixture.jsonArticle; }.bind(this));
    s.stub(cmsOperations, 'create', function () { return Promise.resolve(this.fixture.jsonArticle); }.bind(this));
    s.stub(cmsOperations.remove, 'remove', function () { return null; }.bind(this));

    // test
    var newPostUrl = 'article-2.html'
    cmsOperations.duplicate('article-1.html', 'article', '', newPostUrl, {}, false)
    .then(function(resSave) {
      chai.expect(resSave.abe_meta).to.not.be.undefined;
      chai.expect(resSave.abe_meta.link).to.be.equal('/article-2.html');

      cmsOperations.duplicate('article-1.html', 'article', '', newPostUrl, {}, true)
      .then(function(resSave2) {
        chai.expect(resSave2.abe_meta).to.not.be.undefined;
        chai.expect(resSave2.abe_meta.link).to.be.equal('/article-2.html');

        // unstub
        abeExtend.hooks.instance.trigger.restore()
        sinon.assert.calledTwice(Manager.instance.getList)
        Manager.instance.getList.restore()
        sinon.assert.calledTwice(coreUtils.slug.clean)
        coreUtils.slug.clean.restore()
        sinon.assert.calledTwice(coreUtils.array.filter)
        coreUtils.array.filter.restore()
        cmsData.file.get.restore()
        sinon.assert.calledTwice(cmsOperations.create)
        cmsOperations.create.restore()
        sinon.assert.calledOnce(cmsOperations.remove.remove)
        cmsOperations.remove.remove.restore()
        done()
      }.bind(this))
    }.bind(this))
  });
});
