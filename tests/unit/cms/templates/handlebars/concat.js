var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('concat 1', function() {
  it('concat strings', function() {
    var fn = hbs.compile("{{concat v1 v2 v3}}");
    var res = fn({v1: 'one', v2: 'two', v3: 'three'})
    chai.expect(res).to.be.equal('onetwothree');
  });
});
