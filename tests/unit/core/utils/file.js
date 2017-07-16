import chai from 'chai'
import path from 'path'
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'
import mkdirp from 'mkdirp'
import fse from 'fs-extra'

import {
  coreUtils,
  abeExtend,
  cmsData,
  config,
  Manager
} from '../../../../src/cli'

config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

describe('coreUtils.file', function() {

  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          articleJsoninline: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-data-jsoninline.html'), 'utf8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * coreUtils.file.addFolder
   * 
   */
  it('coreUtils.file.changePath()', function() {
    var pathOrigin = '/post/test.html'
    var change = 'newpost'
    var result = coreUtils.file.changePath(pathOrigin, change)
    chai.expect(result).to.be.a('string')
    chai.expect(result.replace(config.root, '')).to.equal('/newpost/test.html')
  });

  it('cmsData.source.getContent()', function(done) {
    var filePath = path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-data-jsoninline.html')
    var result = coreUtils.file.getContent(filePath)

    chai.expect(result).to.be.equal(this.fixture.articleJsoninline)
    done()
  });

  /**
   * coreUtils.file.addFolder
   * 
   */
  it('coreUtils.file.addFolder()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(mkdirp, 'mkdirP')
    stub.returns({'test':'test'});
    var result = coreUtils.file.addFolder('path/to/folder')
    chai.expect(result).to.be.a('string')
    chai.expect(result).to.equal('path/to/folder')
    mkdirp.mkdirP.restore()
  });

  /**
   * coreUtils.file.removeFolder
   * 
   */
  it('coreUtils.file.removeFolder()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(fse, 'remove')
    stub.returns({});
    var result = coreUtils.file.removeFolder('path/to/folder')
    chai.expect(result).to.be.a('string')
    chai.expect(result).to.equal('path/to/folder')
    fse.remove.restore()
  });

  /**
   * coreUtils.file.getDate
   * 
   */
  it('coreUtils.file.getDate()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(cmsData.fileAttr, 'get')
    stub.returns({d: '2016-12-07T13:04:18.810Z'});
    var result = coreUtils.file.getDate(path.join(config.root, config.data.url, 'article-abe-d20161207T130418810Z.json'))
    chai.expect(result.getYear()).to.equal(116)
    cmsData.fileAttr.get.restore()
  });

  /**
   * coreUtils.file.addDateIsoToRevisionPath
   * 
   */
  it('coreUtils.file.addDateIsoToRevisionPath()', function() {
    var date = '20161207T132049118Z'
    var urlRevision = path.join(config.root, config.data.url, 'article-abe-d' + date + '.json')
    this.sinon = sinon.sandbox.create();

    var stub = sinon.stub(cmsData.revision, 'removeStatusAndDateFromFileName')
    stub.returns(date);

    var stub2 = sinon.stub(cmsData.fileAttr, 'add')
    stub2.returns(urlRevision);

    var result = coreUtils.file.addDateIsoToRevisionPath(path.join(config.root, config.data.url, 'article.json'), 'draft')
    chai.expect(result).to.be.a('string')
    chai.expect(result).to.equal(urlRevision)
    cmsData.revision.removeStatusAndDateFromFileName.restore()
    cmsData.fileAttr.add.restore()
  });

  /**
   * coreUtils.file.exist
   * 
   */
  it('coreUtils.file.exist()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(fse, 'statSync')
    stub.returns('');
    var result = coreUtils.file.exist('path/to/file')
    chai.expect(result).to.be.true
    fse.statSync.restore()
  });

});
