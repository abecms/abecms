import chai from 'chai'
import path from 'path'
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'

import {
  coreUtils,
  abeExtend,
  cmsData,
  config
} from '../../../../src/cli'
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

describe('coreUtils.random', function() {

  /**
   * coreUtils.random.generateUniqueIdentifier
   * 
   */
  it('coreUtils.random.generateUniqueIdentifier()', function() {
    var result = coreUtils.random.generateUniqueIdentifier()
    chai.expect(result).to.be.a('string')
    chai.expect(result.length).to.equal(6)

    var result2 = coreUtils.random.generateUniqueIdentifier(3)
    chai.expect(result2).to.be.a('string')
    chai.expect(result2.length).to.equal(3)
  });

});
