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
} from '../../../src/cli'
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

describe('coreUtils.text', function() {

  /**
   * coreUtils.text.replaceUnwantedChar
   * 
   */
  it('coreUtils.text.replaceUnwantedChar()', function() {
    var list = coreUtils.text.replaceUnwantedChar('Š')
    chai.expect(list.indexOf('Š')).to.equal(-1);
  });

});
