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
  config
} from '../../../src/cli'
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

describe('coreUtils.file', function() {

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
    chai.expect(result.toString()).to.equal('Wed Dec 07 2016 14:04:18 GMT+0100 (CET)')
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
