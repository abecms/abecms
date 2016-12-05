import chai from 'chai'
import path from 'path'
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'
import execPromise from 'child-process-promise'
import mkdirp from 'mkdirp'
import events from 'events'
import {
  cmsStructure,
  abeExtend,
  config
} from '../../../src/cli'

config.set({root: path.join(process.cwd(), 'test','fixtures')})

describe('cmsStructure', function() {

  var folderPath = '/my/folder/path'
  
  /**
   * cmsStructure.structure.addFolder
   * 
   */
  it('cmsStructure.structure.addFolder()', function() {
    this.sinon = sinon.sandbox.create();
    //TODO: find how to stub function litteral "mkdirp"
    // var stub = sinon.stub(mkdirp, "")
    // var stub = sinon.createStubInstance(mkdirp);

    // var result = cmsStructure.structure.addFolder(folderPath)
    // chai.expect(result).to.not.be.undefined
    // chai.expect(result).to.be.a('string')
    // chai.expect(result).to.equal(folderPath)
    // chai.expect(result).to.equal(path.join(config.root, config.publish.url, '/myImageFolder'))
    // sinon.assert.calledOnce(mkdirp)
    // mkdirp.restore()
  });

  /**
   * cmsStructure.structure.removeFolder
   * 
   */
  it('cmsStructure.structure.removeFolder()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(execPromise, "exec")
    stub.returns(Promise.resolve({
      'stdout': null,
      'stderr': null
    }));
    var result = cmsStructure.structure.removeFolder(folderPath)
    chai.expect(result).to.not.be.undefined
    chai.expect(result).to.equal(folderPath)
    sinon.assert.calledOnce(execPromise.exec)
    execPromise.exec.restore()
  });

  /**
   * cmsStructure.structure.editStructure
   * 
   */
  it('cmsStructure.structure.editStructure()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(cmsStructure.structure, "removeFolder")
    stub.returns('')
    var result = cmsStructure.structure.editStructure('remove', folderPath)
    chai.expect(result).to.not.be.undefined
    chai.expect(result).to.equal(folderPath)
    sinon.assert.calledOnce(cmsStructure.structure.removeFolder)
    cmsStructure.structure.removeFolder.restore()
  });

});
