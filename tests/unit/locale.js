var chai = require('chai');
var path = require('path');

var config = require('../../src/cli').config
config.set({root: path.join(__dirname, 'fixtures')})

import locale from '../../src/server/helpers/abe-locale'

describe('locale', function() {

  /**
   * locale
   * 
   */
  it('locale', function() {
    chai.expect(locale).to.have.property('word')
    chai.expect(locale.word).to.be.a('string')
    chai.expect(locale.word).to.equal('a word')
  });

});
