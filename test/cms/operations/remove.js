var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test','fixtures')})

var abeExtend = require('../../../src/cli').abeExtend
var cmsData = require('../../../src/cli').cmsData
var Manager = require('../../../src/cli').Manager
var coreUtils = require('../../../src/cli').coreUtils
var cmsOperations = require('../../../src/cli').cmsOperations
var cmsTemplates = require('../../../src/cli').cmsTemplates
var Manager = require('../../../src/cli').Manager;
var Page = require('../../../src/cli').Page;

describe('cmsOperations', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          htmlArticle: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article.html'), 'utf8'),
          jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'test', 'fixtures', 'files', 'article-2.json')),
          jsonHomepage: fse.readJsonSync(path.join(process.cwd(), 'test', 'fixtures', 'data', 'homepage-1.json'))
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsOperations.remove.remove
   * 
   */
  it('cmsOperations.remove.removeFile()', function() {
    // stub
    var s = sinon.sandbox.create();
    s.stub(fse, 'removeSync', function () { return null; }.bind(this));
    s.stub(coreUtils.file, 'exist', function () { return null; }.bind(this));

    var res = cmsOperations.remove.removeFile('test.html')
    chai.expect(res).to.be.equal(undefined);

    fse.removeSync.restore()
    coreUtils.file.exist.restore()
  });

  /**
   * cmsOperations.remove.remove
   * 
   */
  it('cmsOperations.remove.remove()', function() {
    // stub
    var s = sinon.sandbox.create();
    s.stub(abeExtend.hooks.instance, 'trigger', function (str, obj) { return str, obj; }.bind(this));
    s.stub(cmsOperations.remove, 'removeFile', function () { return null; }.bind(this));
    s.stub(cmsData.revision, 'getVersions', function () { return []; }.bind(this));
    s.stub(Manager.instance, 'removePostFromList', function () { return null; }.bind(this));

    var res = cmsOperations.remove.remove('test.html')
    chai.expect(res).to.be.equal(undefined);

    abeExtend.hooks.instance.trigger.restore()
    cmsOperations.remove.removeFile.restore()
    cmsData.revision.getVersions.restore()
    Manager.instance.removePostFromList.restore()
  });
});
