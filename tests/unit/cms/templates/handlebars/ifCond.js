var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('ifCond 1', function() {
  it("shouldn't be equal ", function() {
    var fn = hbs.compile("{{#ifCond v1 v2}}a{{else}}b{{/ifCond}}");
    var res = fn({v1: 'a', v2: 'b'})
    chai.expect(res).to.be.equal('b');
  });

  it("should be equal ", function() {
    var fn = hbs.compile("{{#ifCond v1 v2}}a{{else}}b{{/ifCond}}");
    var res = fn({v1: 'a', v2: 'a'})
    chai.expect(res).to.be.equal('a');
  });

});
