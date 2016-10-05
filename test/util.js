var chai = require('chai');
var coreUtils = require('../src/cli').coreUtils

describe('Util', function() {

  /**
   * coreUtils.text.replaceUnwantedChar
   * 
   */
  it('coreUtils.text.replaceUnwantedChar', function() {
  	var list = coreUtils.text.replaceUnwantedChar('Š')
  	chai.expect(list.indexOf('Š')).to.equal(-1);
  });
});
