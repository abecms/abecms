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

describe('coreUtils.slug', function() {

  var arr = [{'test': 'val'}, {'test2': 'val2'}];

  /**
   * coreUtils.slug.clean
   * 
   */
  it('coreUtils.slug.clean()', function() {
    var result = coreUtils.slug.clean('té§eèàº^^s:t sLuG');
    chai.expect(result).to.be.a('string')
    chai.expect(result).to.equal('te-eeao-s-t-slug.html')
  });

});
