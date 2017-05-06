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

  /**
   * cmsOperations.save.saveJson
   * 
   */
  it('cmsOperations.save.saveJson()', function() {
    // stub
    var s = sinon.sandbox.create();
    s.stub(fse, 'writeJsonSync', function () { return null; }.bind(this));
    // s.stub(xss, 'exist', function () { return null; }.bind(this));

    var res = cmsOperations.save.saveJson('test.json', {})
    chai.expect(res).to.be.equal(true);

    fse.writeJsonSync.restore()
  });

  /**
   * cmsOperations.save.saveHtml
   * 
   */
  it('cmsOperations.save.saveHtml()', function() {
    // stub
    var s = sinon.sandbox.create();
    s.stub(fse, 'writeFileSync', function () { return null; }.bind(this));
    s.stub(mkdirp, 'sync', function () { return null; }.bind(this));

    var res = cmsOperations.save.saveHtml('test.json', {})
    chai.expect(res).to.be.equal(true);

    fse.writeFileSync.restore()
    mkdirp.sync.restore()
  });
});
