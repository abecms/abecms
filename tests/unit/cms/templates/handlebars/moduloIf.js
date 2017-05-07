var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('moduloIf 1', function() {
  it("should modulo", function() {
    var fn = hbs.compile("{{#moduloIf val1 val2}}a{{else}}b{{/moduloIf}}");
    var res = fn({val1: 2, val2: 2})
    chai.expect(res).to.be.equal('a')
  });

  it("shouldn't modulo", function() {
    var fn = hbs.compile("{{#moduloIf val1 val2}}a{{else}}b{{/moduloIf}}");
    var res = fn({val1: 2, val2: 3})
    chai.expect(res).to.be.equal('b')
  });
});
