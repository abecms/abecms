import chai from 'chai'
import path from 'path'
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'
import mkdirp from 'mkdirp'

import {
  coreUtils,
  abeExtend,
  config
} from '../../../../src/cli'
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

describe('coreUtils.file', function() {

  /**
   * coreUtils.file.addFolder
   * 
   */
  it('coreUtils.file.addFolder()', function() {
    sinon.createStubInstance(mkdirp)

    var result = coreUtils.file.addFolder('path/to/folder')
    chai.expect(result).to.be.a('string')

  });
});
