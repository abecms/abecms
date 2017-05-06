import chai from 'chai'
import path from 'path'
import {
  cmsEditor,
  config
} from '../../../../../src/cli'
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

describe('cmsEditor.folders', function() {
  
  /**
   * cmsEditor.folders
   */
  it('cmsEditor.folders()', function() {
    var result = cmsEditor.folders([{path: ''}], 1, null, {'level-1': 'my wording'})
    var wordingExist = result.indexOf('my wording')
    chai.expect(result).to.be.a('string')
    chai.expect(wordingExist).to.equal(110)
  });
});
