var chai = require('chai')
var expect = chai.expect
var hbs = require('../../../../../src/cli').Handlebars

describe('times 1', function() {
  it("times ", function() {
    var fn = hbs.compile("{{#times v1}}a{{/times}}");
    var res = fn({v1: 3})
    chai.expect(res).to.be.equal('aaa');
  });
});
