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
  coreUtils,
  config
} from '../../../../src/cli'

config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

describe('cmsStructure', function() {

  var folderPath = '/my/folder/path'
  
  /**
   * cmsStructure.structure.editStructure
   * 
   */
  it('cmsStructure.structure.editStructure()', function() {
    this.sinon = sinon.sandbox.create();
    var stub = sinon.stub(coreUtils.file, "removeFolder")
    stub.returns('')
    var result = cmsStructure.structure.editStructure('remove', folderPath)
    chai.expect(result).to.not.be.undefined
    chai.expect(result).to.equal(folderPath)
    sinon.assert.calledOnce(coreUtils.file.removeFolder)
    coreUtils.file.removeFolder.restore()
  });

});
